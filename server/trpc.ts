import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { getSession, type SessionUser } from "@/lib/auth";

export type Context = {
  user: SessionUser | null;
};

export async function createContext(): Promise<Context> {
  const user = await getSession();
  return { user };
}

const t = initTRPC.context<Context>().create({ transformer: superjson });

export const router = t.router;
export const publicProcedure = t.procedure;

// Must be logged in + have an organizationId
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
  return next({ ctx: { ...ctx, user: ctx.user } });
});

export const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (ctx.user.role !== "ADMIN") throw new TRPCError({ code: "FORBIDDEN", message: "Admin only" });
  return next({ ctx });
});

export const teacherProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (ctx.user.role !== "TEACHER" && ctx.user.role !== "ADMIN")
    throw new TRPCError({ code: "FORBIDDEN", message: "Teacher or Admin only" });
  return next({ ctx });
});
