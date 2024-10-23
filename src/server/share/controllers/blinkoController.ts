import { Allow, BackendMethod, EntityFilter, MembersOnly } from 'remult';
import { attachmentsRepo, notesRepo, tagRepo, tagsToNoteRepo, userRepo } from '..';
import { Tag } from '../entities/tag';
import { Note, NoteType } from '../entities/notes';
import { helper, TagTreeNode } from '@/lib/helper';
import { _ } from '@/lib/lodash';
import { Attachment } from '../entities/attachments';
import { fetchApi } from '@/lib/fetch';

export type AttachmentsType = Pick<Attachment, 'name' | 'path' | 'size'>

export class BlinkoController {
  @BackendMethod({ allowed: Allow.authenticated, apiPrefix: 'v1' })
  static async notes({
    tagId,
    //@ts-ignore
    type = -1,
    isArchived = false,
    isRecycle = false,
    searchText = '',
    page = 1,
    size = 10,
    orderBy = 'desc'
  }: { tagId?: number | null, page?: number, size?: number, orderBy?: 'asc' | 'desc', type?: NoteType, isArchived?: boolean, isRecycle?: boolean, searchText?: string }) {

    let where: EntityFilter<Note> = {
      isArchived,
      isRecycle
    }
    if (tagId) {
      const tags = await tagsToNoteRepo.find({ where: { tagId } })
      console.log("findTags!", tags)
      where.id = {
        $in: tags?.map(i => i.noteId)
      }
    }
    if (searchText != '') {
      where.content = {
        $contains: searchText
      }
    }
    //@ts-ignore
    if (type != -1) {
      where.type = type
    }
    console.log({ where })
    const result = await notesRepo.find({
      limit: size,
      page: page,
      orderBy: {
        createdAt: orderBy
      },
      where
    })

    return result
  }

  @BackendMethod({ allowed: Allow.authenticated, apiPrefix: 'v1' })
  static async resources({
    page = 1,
    size = 10,
    searchText = ''
  }: { page?: number, size?: number, searchText?: string }) {
    let where: EntityFilter<Attachment> = {}
    const result = await attachmentsRepo.find({
      limit: size,
      page: page,
      orderBy: {
        createdAt: 'desc'
      },
      where
    })
    return result
  }

  @BackendMethod({ allowed: Allow.authenticated, apiPrefix: 'v1', transactional: true })
  static async upsertBlinko({
    content,
    //@ts-ignore
    type = -1,
    attachments = [],
    isArchived = null,
    id
  }: { content?: string, attachments?: AttachmentsType[], id?: number, type?: NoteType, isArchived?: boolean | null }) {
    content = content?.replace(/\\/g, '').replace(/&#x20;/g, ' ')
    const tagTree = helper.buildHashTagTreeFromHashString(helper.extractHashtags(content ?? ''))

    let newTags: Tag[] = []
    const handleAddTags = async (tagTree: TagTreeNode[], parentTag: Tag | undefined, note?: Note) => {
      for (const i of tagTree) {
        let hasTag = await tagRepo.findFirst({ name: i?.name, parent: parentTag?.id ?? 0 });
        if (!hasTag) {
          hasTag = await tagRepo.insert({ name: i.name, parent: parentTag?.id ?? 0 });
        }
        if (note) {
          const hasRelation = await tagsToNoteRepo.findFirst({ tag: hasTag, noteId: note.id })
          !hasRelation && await notesRepo.relations(note).tags.insert({ tag: hasTag })
        }
        if (i?.children) {
          await handleAddTags(i.children, hasTag, note);
        }
        newTags.push(hasTag)
      }
    }
    const update: Partial<MembersOnly<Note>> = {}
    //@ts-ignore
    if (type != -1) {
      update.type = type
    }
    if (isArchived != null) {
      update.isArchived = isArchived
    }
    if (content) {
      update.content = content
    }
    if (id) {
      const note = await notesRepo.update(id, update)
      const oldTagsInThisNote = await notesRepo.relations(note!).tags.find()
      await handleAddTags(tagTree, undefined)
      const oldTags = oldTagsInThisNote.map(i => i.tag).filter(i => !!i)
      const oldTagsString = oldTags.map(i => `${i?.name}<key>${i?.parent}`)
      const newTagsString = newTags.map(i => `${i?.name}<key>${i?.parent}`)
      const needTobeAddedRelationTags = _.difference(newTagsString, oldTagsString);
      const needToBeDeletedRelationTags = _.difference(oldTagsString, newTagsString);
      console.log({ needToBeDeletedRelationTags })
      if (needToBeDeletedRelationTags.length != 0) {
        await notesRepo.relations(note).tags.deleteMany({
          where: {
            tag: needToBeDeletedRelationTags.map(i => {
              const [name, parent] = i.split('<key>')
              return oldTags.find(t => (t?.name == name) && (t?.parent == Number(parent)))
            })
          }
        })
      }

      if (needTobeAddedRelationTags.length != 0) {
        await notesRepo.relations(note).tags.insert(
          needTobeAddedRelationTags.map(i => {
            const [name, parent] = i.split('<key>')
            return { tag: newTags.find(t => (t.name == name) && (t.parent == Number(parent))) }
          })
        )
      }

      //delete unused tags
      const allTagsIds = oldTags?.map(i => i?.id)
      const usingTags = (await tagsToNoteRepo.find({ where: { tagId: { $in: allTagsIds } } })).map(i => i.tag?.id).filter(i => !!i)
      console.log({ allTagsIds, usingTags })
      const needTobeDeledTags = _.difference(allTagsIds, usingTags);
      console.log({ needTobeDeledTags })
      if (needTobeDeledTags) {
        await tagRepo.deleteMany({ where: { id: needTobeDeledTags } })
      }

      //insert not repeate attachments
      try {
        if (attachments.length != 0) {
          const oldAttachments = await attachmentsRepo.find({ where: { note: note } })
          const needTobeAddedAttachmentsPath = _.difference(attachments.map(i => i.path), oldAttachments.map(i => i.path));
          if (needTobeAddedAttachmentsPath.length != 0) {
            await notesRepo.relations(note).attachments.insert(attachments
              .filter(t => needTobeAddedAttachmentsPath.includes(t.path))
              .map(i => { return { note, ...i } }))
          }
        }
      } catch (err) {
        console.log(err)
      }
      return note
    } else {
      try {
        const note = await notesRepo.insert({ content, type })
        await handleAddTags(tagTree, undefined, note)
        await notesRepo.relations(note).attachments.insert(attachments.map(i => { return { note, ...i } }))
        return note
      } catch (error) {
        console.log(error)
      }
    }
  }

  @BackendMethod({ allowed: Allow.authenticated, apiPrefix: 'v1', transactional: true })
  static async batchUpdateTagByNoteIds({
    tag,
    ids
  }: { ids?: number[], tag: string }) {
    const notes = await notesRepo.find({ where: { id: { $in: ids } } })
    for (const note of notes) {
      const newContent = note.content += ' #' + tag
      await BlinkoController.upsertBlinko({ content: newContent, id: note.id })
    }
    return true
  }

  @BackendMethod({ allowed: Allow.authenticated, apiPrefix: 'v1', transactional: true })
  static async updateManyBlinko({
    //@ts-ignore
    type = -1,
    isArchived = null,
    isRecycle = null,
    ids
  }: { ids?: number[], type?: NoteType, isArchived?: boolean | null, isRecycle?: boolean | null }) {
    const set: Partial<MembersOnly<Note>> = {}
    //@ts-ignore
    if (type != -1) {
      type && (set.type = type)
    }
    if (isArchived != null) {
      isArchived && (set.isArchived = isArchived)
    }
    if (isRecycle != null) {
      isRecycle && (set.isArchived = isRecycle)
    }
    return await notesRepo.updateMany({
      where: { id: { $in: ids } }, set
    })
  }

  @BackendMethod({ allowed: Allow.authenticated, apiPrefix: 'v1', transactional: true })
  static async updateTagIcon({ id, icon }: { id: number, icon: string }) {
    return await tagRepo.update(id, { icon })
  }
}
