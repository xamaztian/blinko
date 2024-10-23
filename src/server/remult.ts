import { remultNextApp } from 'remult/remult-next';
import { createPostgresDataProvider } from 'remult/postgres';
import { Accounts } from '@/server/share/entities/accounts';
import { remult, SubscriptionChannel } from 'remult';
import { controllers, entities } from '@/server/share/index';

export const remultServer = remultNextApp({
  dataProvider: createPostgresDataProvider({
    connectionString: process.env['DATABASE_URL']!,
  }),
  entities,
  controllers,
});

export const openApiDoc = remultServer.openApiDoc({
  title: "Blinko Open API",
});

export const handleAuthorize = async (userInfo: Accounts) => {
  return remultServer.withRemult(async () => {
    try {
      if (userInfo.id) {
        return true
      } else {
        return false
      }
    } catch (error) {
      return false;
    }
  });
};
