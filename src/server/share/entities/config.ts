import { Allow, Entity, Fields, Relations, Validators } from 'remult';

export type ConfigKey = "isAutoArchived" | "isUseAI" | "aiModelProvider" | "aiApiKey" | 'aiApiEndpoint' | 'aiModel' | 'isInit'

@Entity('config', {
  allowApiCrud: Allow.authenticated,
  allowApiDelete: Allow.authenticated,
})

export class Config {
  @Fields.autoIncrement()
  id: number;

  @Fields.string()
  key: ConfigKey; //days

  @Fields.json()
  config: {
    type: string,
    value: any
  };
}
