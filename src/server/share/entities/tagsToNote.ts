import { Entity, Fields, Relations, Validators } from 'remult';
import { Tag } from './tag';

@Entity<TagsToNote>('tagsToNote', {
  allowApiCrud: false,
  allowApiDelete: false,
  id: {
    noteId: true,
    tagId: true,
  },
})
export class TagsToNote {
  @Fields.autoIncrement()
  id: number;

  @Fields.integer()
  noteId: number;

  @Fields.integer()
  tagId: number;

  @Relations.toOne<TagsToNote, Tag>(() => Tag, { field: 'tagId', defaultIncluded: true })
  tag?: Tag
}
