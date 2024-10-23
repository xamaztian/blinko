import { Allow, BackendMethod, EntityFilter, MembersOnly, remult } from 'remult';
import { attachmentsRepo, notesRepo, tagRepo, tagsToNoteRepo, userRepo } from '..';
import { Tag } from '../entities/tag';
import { Note, NoteType } from '../entities/notes';
import { helper, TagTreeNode } from '@/lib/helper';
import { TagsToNote } from '../entities/tagsToNote';
import { _ } from '@/lib/lodash';
import { Attachment } from '../entities/attachments';
import { BlinkoController } from './blinkoController';

export class DeleteController {
  @BackendMethod({ allowed: Allow.authenticated, apiPrefix: 'v1' })
  static async deleteNotes({ ids }: { ids: number[] }) {
    const notes = await notesRepo.find({ where: { id: { $in: ids } } })
    const handleDeleteRelation = async () => {
      for (const note of notes) {
        await notesRepo.relations(note).tags.deleteMany({ where: { noteId: note.id } })

        //delete unused tags
        const allTagsInThisNote = note.tags || []
        const oldTags = allTagsInThisNote.map(i => i.tag).filter(i => !!i)
        const allTagsIds = oldTags?.map(i => i?.id)
        const usingTags = (await tagsToNoteRepo.find({ where: { tagId: { $in: allTagsIds } } })).map(i => i.tag?.id).filter(i => !!i)
        const needTobeDeledTags = _.difference(allTagsIds, usingTags);

        if (needTobeDeledTags) {
          await tagRepo.deleteMany({ where: { id: needTobeDeledTags } })
        }

        if (note.attachments) {
          for (const attachment of note.attachments) {
            console.log(`${process.env.NEXT_PUBLIC_BASE_URL}/api/file/delete`, attachment.path)
            try {
              await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/file/delete`, {
                method: 'POST',
                body: JSON.stringify({ attachment_path: attachment.path }),
              });
            } catch (error) {
              console.log(error)
            }
          }
        }
      }
    }
    await handleDeleteRelation()
    await notesRepo.deleteMany({ where: { id: { $in: ids } } })
    return { ok: true }
  }

  @BackendMethod({ allowed: Allow.authenticated, apiPrefix: 'v1' })
  static async deleteOnlyTag({ id }: { id: number }) {
    const tag = await tagRepo.findFirst({ id })
    const relations = await tagsToNoteRepo.find({ where: { tag } })
    const allNotesId = relations?.map(i => i.noteId) ?? []
    for (const noteId of allNotesId) {
      const note = await notesRepo.findFirst({ id: noteId })
      await notesRepo.update(note!.id, { content: note!.content.replace(new RegExp(`#${tag!.name}`, 'g'), '') })
      await notesRepo.relations(note!).tags.deleteMany({ where: { tagId: tag!.id } })
    }
    await tagRepo.delete({ id })
    return { ok: true }
  }

  @BackendMethod({ allowed: Allow.authenticated, apiPrefix: 'v1' })
  static async deleteTagWithAllNote({ id }: { id: number }) {
    const tag = await tagRepo.findFirst({ id })
    const relations = await tagsToNoteRepo.find({ where: { tag } })
    const allNotesId = relations?.map(i => i.noteId) ?? []
    for (const noteId of allNotesId) {
      await DeleteController.deleteNotes({ ids: [noteId] })
    }
    return { ok: true }
  }

  @BackendMethod({ allowed: Allow.authenticated, apiPrefix: 'v1' })
  static async updateTag({ id, originName, newName }: { id: number, originName: string, newName: string }) {
    const tagToNote = await tagsToNoteRepo.find({ where: { tagId: id } })
    const noteIds = tagToNote.map(i => i.noteId)
    const hasTagNote = await notesRepo.find({ where: { id: { $in: noteIds } } })
    hasTagNote.map(i => {
      i.content = i.content.replace(new RegExp(`#${originName}`, 'g'), "#" + newName)
    })
    for (const note of hasTagNote) {
      await BlinkoController.upsertBlinko({ content: note.content, id: note.id })
    }
    return { ok: true }
  }
}
