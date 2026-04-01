import { z } from "zod/v4";
import { router, protectedProcedure, adminProcedure } from "../trpc";
import { prisma } from "@/lib/prisma";
import { TRPCError } from "@trpc/server";

export const libraryRouter = router({
  books: protectedProcedure.query(async ({ ctx }) => {
    return prisma.libraryBook.findMany({
      where: { organizationId: ctx.user.organizationId },
      include: { issues: { where: { returnDate: null }, include: { student: { select: { name: true, rollNumber: true } } } } },
      orderBy: { title: "asc" },
    });
  }),

  addBook: adminProcedure
    .input(z.object({
      title: z.string().min(1),
      author: z.string().min(1),
      isbn: z.string().optional(),
      category: z.string().optional(),
      totalCopies: z.number().min(1).default(1),
    }))
    .mutation(async ({ input, ctx }) => {
      return prisma.libraryBook.create({
        data: {
          title: input.title,
          author: input.author,
          isbn: input.isbn,
          category: input.category,
          totalCopies: input.totalCopies,
          availableCopies: input.totalCopies,
          organizationId: ctx.user.organizationId,
        },
      });
    }),

  updateBook: adminProcedure
    .input(z.object({
      id: z.string(),
      title: z.string().min(1),
      author: z.string().min(1),
      isbn: z.string().optional(),
      category: z.string().optional(),
      totalCopies: z.number().min(1),
    }))
    .mutation(async ({ input, ctx }) => {
      const book = await prisma.libraryBook.findFirst({ where: { id: input.id, organizationId: ctx.user.organizationId } });
      if (!book) throw new TRPCError({ code: "NOT_FOUND" });
      const issuedCount = book.totalCopies - book.availableCopies;
      const newAvailable = Math.max(0, input.totalCopies - issuedCount);
      return prisma.libraryBook.update({
        where: { id: input.id },
        data: { title: input.title, author: input.author, isbn: input.isbn, category: input.category, totalCopies: input.totalCopies, availableCopies: newAvailable },
      });
    }),

  deleteBook: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const book = await prisma.libraryBook.findFirst({ where: { id: input.id, organizationId: ctx.user.organizationId } });
      if (!book) throw new TRPCError({ code: "NOT_FOUND" });
      return prisma.libraryBook.delete({ where: { id: input.id } });
    }),

  issueBook: adminProcedure
    .input(z.object({
      bookId: z.string(),
      studentId: z.string(),
      dueDate: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      const orgId = ctx.user.organizationId;
      const book = await prisma.libraryBook.findFirst({ where: { id: input.bookId, organizationId: orgId } });
      if (!book) throw new TRPCError({ code: "NOT_FOUND" });
      if (book.availableCopies <= 0) throw new TRPCError({ code: "BAD_REQUEST", message: "No copies available" });

      await prisma.libraryBook.update({ where: { id: input.bookId }, data: { availableCopies: { decrement: 1 } } });

      return prisma.bookIssue.create({
        data: {
          bookId: input.bookId,
          studentId: input.studentId,
          dueDate: new Date(input.dueDate),
          organizationId: orgId,
        },
      });
    }),

  returnBook: adminProcedure
    .input(z.object({ issueId: z.string(), fine: z.number().optional() }))
    .mutation(async ({ input, ctx }) => {
      const issue = await prisma.bookIssue.findFirst({ where: { id: input.issueId, organizationId: ctx.user.organizationId } });
      if (!issue) throw new TRPCError({ code: "NOT_FOUND" });
      if (issue.returnDate) throw new TRPCError({ code: "BAD_REQUEST", message: "Already returned" });

      await prisma.libraryBook.update({ where: { id: issue.bookId }, data: { availableCopies: { increment: 1 } } });

      return prisma.bookIssue.update({
        where: { id: input.issueId },
        data: { returnDate: new Date(), fine: input.fine || 0 },
      });
    }),

  issues: protectedProcedure.query(async ({ ctx }) => {
    return prisma.bookIssue.findMany({
      where: { organizationId: ctx.user.organizationId },
      include: {
        book: { select: { title: true, author: true } },
        student: { select: { name: true, rollNumber: true } },
      },
      orderBy: { issueDate: "desc" },
    });
  }),
});
