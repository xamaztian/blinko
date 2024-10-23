import { Allow, BackendMethod, remult } from 'remult';
import { configRepo, userRepo } from '..';
import { helper } from '@/lib/helper';
import { encode } from 'next-auth/jwt';
import { ConfigKey } from '../entities/config';

export class ConfigController {
  @BackendMethod({ allowed: true })
  static async updateConfig({ key, value }: { key: ConfigKey, value: any }) {
    const hasKey = await configRepo.findFirst({ key })
    if (hasKey) {
      return await configRepo.update(hasKey.id, { config: { type: typeof value, value } })
    }
    return await configRepo.insert({ key, config: { type: typeof value, value } })
  }
}
