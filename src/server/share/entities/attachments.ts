import { Allow, Entity, Fields, Relations, Validators } from 'remult';
import { Note } from './notes';

@Entity('attachments', {
  allowApiCrud: false,
  allowApiDelete: Allow.authenticated,
})
export class Attachment {
  @Fields.autoIncrement()
  id: number;

  @Fields.boolean()
  isShare = false;

  @Fields.string()
  sharePassword = '';;
  
  @Fields.string()
  name: string = '';

  @Fields.string()
  path: string = '';

  @Fields.number()
  size: number = 0;

  @Relations.toOne(() => Note, { defaultIncluded: false })
  note?: Note

  @Fields.createdAt()
  createdAt = new Date()

  @Fields.updatedAt()
  updatedAt = new Date()
}
