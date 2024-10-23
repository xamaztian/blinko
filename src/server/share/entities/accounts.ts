import { Entity, Fields, Relations, Validators } from 'remult';
import { Note } from './notes';

@Entity('accounts', {
  allowApiCrud: false,
  allowApiDelete: false,
})
export class Accounts {
  @Fields.autoIncrement()
  id: number;

  @Fields.string()
  name: string = '';

  @Fields.string()
  nickname: string = '';

  @Fields.string()
  password: string;

  @Fields.string()
  image: string;
  
  @Fields.string()
  apiToken?: string

  @Relations.toOne(() => Note, { defaultIncluded: false })
  note?: Note

  @Fields.string()
  role: string;

  @Fields.createdAt()
  createdAt? = new Date()

  @Fields.updatedAt()
  updatedAt? = new Date()
}
