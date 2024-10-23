import { createTRPCClient, httpBatchLink, unstable_httpBatchStreamLink } from '@trpc/client';
import type { AppRouter } from '@/server/routers/_app';
import superjson from 'superjson';

export const api = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `/api/trpc`,
      transformer: superjson
    }),
  ],
});

export const streamApi = createTRPCClient<AppRouter>({
  links: [
    unstable_httpBatchStreamLink({
      url: `/api/trpc`,
      transformer: superjson
    })
  ],
});

