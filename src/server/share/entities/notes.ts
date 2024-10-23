import { Allow, Entity, Fields, Relations, Validators } from 'remult';
import { Attachment } from './attachments';
import { TagsToNote } from './tagsToNote';
import { Accounts } from './accounts';

export enum NoteType {
  'BLINKO',
  'NOTE'
}

@Entity('notes', {
  allowApiInsert: false,
  allowApiUpdate: false,
  allowApiDelete: false,
  allowApiRead: Allow.authenticated
})
export class Note {
  @Fields.autoIncrement()
  id: number;

  @Fields.enum(() => NoteType)
  type = NoteType.BLINKO;

  @Fields.string()
  content: string;

  @Fields.boolean()
  isArchived = false;

  @Fields.boolean()
  isRecycle = false;

  @Fields.boolean()
  isShare = false;

  @Fields.boolean()
  isTop = false;

  @Fields.string()
  sharePassword = '';

  @Fields.json()
  metadata: {};

  @Relations.toMany(() => Attachment, { defaultIncluded: true })
  attachments?: Attachment[]

  @Relations.toMany(() => TagsToNote, { field: 'noteId', defaultIncluded: true })
  tags?: TagsToNote[]

  @Relations.toOne(() => Accounts, { defaultIncluded: false })
  users?: Accounts

  @Fields.createdAt()
  createdAt = new Date()

  @Fields.updatedAt()
  updatedAt = new Date()
}
