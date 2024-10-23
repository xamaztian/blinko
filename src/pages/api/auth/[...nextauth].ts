import GithubProvider from 'next-auth/providers/github';
import CredentialsProvider from 'next-auth/providers/credentials';
import { helper } from '@/lib/helper';
import NextAuth from 'next-auth';
import { remultServer } from '@/server/remult';
import { remult } from 'remult';
import { Accounts } from '@/server/share/entities/accounts';
import { UserController } from '@/server/share/controllers/userController';
import { encode } from 'next-auth/jwt';
import { userRepo } from '@/server/share';

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: "User", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        return remultServer.withRemult(async () => {
          try {
            console.log({ credentials })
            const user = await userRepo.find({ where: { name: credentials!.username, password: credentials!.password } });
            if (user && user.length != 0) {
              return { id: user[0]!.id.toString(), name: user[0]!.name || '', nickname: user[0]!.nickname };
            }
            throw new Error(JSON.stringify({ errors: 'user not found', status: false }))
          } catch (error) {
            console.log(error)
            throw new Error(JSON.stringify({ errors: error.message, status: false }))
          }
        });
      }
    })
  ],
  pages: {
    signIn: '/signin',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        //@ts-ignore
        token.nickname = user.nickname
        //@ts-ignore
        token.id = user.id
      }
      return token;
    },
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
    async session({ session, token }) {
      //@ts-ignore
      session.user!.nickname = token.nickname
      //@ts-ignore
      session.user!.id = token.id
      return { ...session, token: token.token, }
    },
  },
});
