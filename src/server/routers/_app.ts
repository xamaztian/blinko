/**
 * This file contains the root router of your tRPC-backend
 */
import { createCallerFactory, router } from '../trpc';
import { aiRouter } from './ai';

export const appRouter = router({
  ai: aiRouter
});
export const createCaller = createCallerFactory(appRouter);
export type AppRouter = typeof appRouter;