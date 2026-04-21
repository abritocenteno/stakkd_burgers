import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("burgerLogs")
      .withIndex("by_visited")
      .order("desc")
      .take(50);
  },
});

export const getById = query({
  args: { id: v.id("burgerLogs") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

export const listByUser = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query("burgerLogs")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

export const create = mutation({
  args: {
    userId: v.string(),
    userName: v.string(),
    userImageUrl: v.optional(v.string()),
    burgerName: v.string(),
    restaurantName: v.string(),
    location: v.optional(v.string()),
    photoStorageId: v.optional(v.id("_storage")),
    notes: v.optional(v.string()),
    visitedAt: v.number(),
    taste: v.number(),
    freshness: v.number(),
    presentation: v.number(),
    sides: v.number(),
    doneness: v.number(),
    value: v.number(),
  },
  handler: async (ctx, args) => {
    const totalScore =
      (args.taste + args.freshness + args.presentation + args.sides + args.doneness + args.value) / 6;

    let photoUrl: string | undefined;
    if (args.photoStorageId) {
      photoUrl = (await ctx.storage.getUrl(args.photoStorageId)) ?? undefined;
    }

    return await ctx.db.insert("burgerLogs", {
      ...args,
      photoUrl,
      totalScore: Math.round(totalScore * 10) / 10,
    });
  },
});

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});
