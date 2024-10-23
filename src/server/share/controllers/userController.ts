import { Allow, BackendMethod, MembersOnly, remult } from 'remult';
import { attachmentsRepo, configRepo, notesRepo, tagRepo, tagsToNoteRepo, userRepo } from '..';
import { helper } from '@/lib/helper';
import { encode } from 'next-auth/jwt';
import { Accounts } from '../entities/accounts';

import { tag, attachments, notes, tagsToNote } from '../initdata'


export class UserController {
  @BackendMethod({ allowed: true })
  static async canRegister() {
    const count = await userRepo.count()
    if (count > 0) {
      return {
        ok: false
      }
    } else {
      return { ok: true }
    }
  }

  @BackendMethod({ allowed: true })
  static async createAdmin({ name, password }) {
    const count = await userRepo.count()
    if (count > 0) {
      return {
        ok: false,
        errorMsg: 'You already have an administrator, and it cannot be created again'
      }
    }
    const res = await userRepo.insert({ name, password, nickname: name })
    if (process.env.NODE_ENV == 'development') {
      await UserController.initData()
    }
    await userRepo.update(res.id, {
      apiToken: await UserController.genToken({ id: res.id, name })
    })
    return { ok: true }

  }

  @BackendMethod({ allowed: false })
  static async initData() {
    const res = await configRepo.findFirst({ key: 'isInit' })
    if (!res?.config?.value || !res) {
      return await Promise.all([
        tagRepo.insert(tag),
        notesRepo.insert(notes),
        tagsToNoteRepo.insert(tagsToNote),
        attachmentsRepo.insert(attachments)
      ])
    }
  }

  @BackendMethod({ allowed: Allow.authenticated })
  static async upsertUser({ id, name, password, nickname }: { id?: number, name?: string, password?: string, nickname?: string }) {
    if (id) {
      const update: Partial<MembersOnly<Accounts>> = {}
      if (name) update.name = name
      if (password) update.password = password
      if (nickname) update.nickname = nickname
      await userRepo.update(id, update)
      return { ok: true }
    } else {
      const res = await userRepo.insert({ name, password })
      await userRepo.update(res.id, {
        apiToken: await UserController.genToken({ id: res.id, name: res.name })
      })
      return { ok: true }
    }
  }

  static async genToken({ id, name }: { id: number, name: string, }) {
    return await encode({
      token: {
        name,
        sub: id.toString(),
      },
      secret: process.env.NEXTAUTH_SECRET!
    })
  }

  @BackendMethod({ allowed: true, apiPrefix: 'v1', transactional: true })
  static async findUserCount() {
    const count = await userRepo.count()
    return count
  }
}
