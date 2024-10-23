import { UserController } from "./controllers/userController";
import { Note } from "./entities/notes";
import { Attachment } from "./entities/attachments";
import { Tag } from "./entities/tag";
import { TagsToNote } from "./entities/tagsToNote";
import { remult } from "remult";
import { BlinkoController } from "./controllers/blinkoController";
import { Config } from "./entities/config";
import { DeleteController } from "./controllers/deleteController";
import { ConfigController } from "./controllers/configController";
import { Accounts } from "./entities/accounts";

export const entities = [Accounts, Note, Attachment, Tag, TagsToNote, Config]
export const controllers = [UserController, BlinkoController, DeleteController, ConfigController]

export const notesRepo = remult.repo(Note)
export const attachmentsRepo = remult.repo(Attachment)
export const tagRepo = remult.repo(Tag)
export const tagsToNoteRepo = remult.repo(TagsToNote)
export const userRepo = remult.repo(Accounts)
export const configRepo = remult.repo(Config)

