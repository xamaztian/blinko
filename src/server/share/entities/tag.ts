import { Allow, Entity, Fields, Relations, Validators } from 'remult';

@Entity('tag', {
  allowApiInsert: false,
  allowApiUpdate: false,
  allowApiDelete: false,
  allowApiRead: Allow.authenticated
})
export class Tag {
  @Fields.autoIncrement()
  id: number;

  // @Fields.string({
  //   validate: [Validators.unique()]
  // })
  @Fields.string()
  name: string = '';

  @Fields.string()
  icon: string = '';

  @Fields.integer({ defaultValue: () => 0 })
  parent: number = 0;

  @Fields.createdAt()
  createdAt = new Date()

  @Fields.updatedAt()
  updatedAt = new Date()
}
