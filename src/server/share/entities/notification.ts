import { Allow, Entity, Fields, Relations, Validators } from 'remult';

@Entity('notifications', {
  allowApiCrud: Allow.authenticated,
  allowApiDelete: Allow.authenticated,
})
export class Notification {
  @Fields.autoIncrement()
  id: number;

  @Fields.string()
  content: string = '';

  @Fields.boolean()
  isRead: boolean = false;

  @Fields.createdAt()
  createdAt = new Date()

  @Fields.updatedAt()
  updatedAt = new Date()
}
