import { remultNext } from 'remult/remult-next';
import { createPostgresDataProvider } from 'remult/postgres';
import { getToken } from 'next-auth/jwt';
import { helper } from '@/lib/helper';
import { controllers, entities } from '@/server/share/index';

export default remultNext({
  dataProvider: createPostgresDataProvider({
    connectionString: process.env['DATABASE_URL']!,
  }),
  entities,
  controllers,
  // @ts-ignore
  getUser: async (req) => {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRE });
    if (!token) {
      return null;
    }
    return {
      id: token.sub,
      name: token.name
    }
  },
});
