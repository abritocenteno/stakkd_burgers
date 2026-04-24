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
    tags: v.optional(v.array(v.string())),
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

export const update = mutation({
  args: {
    id: v.id("burgerLogs"),
    userId: v.string(),
    burgerName: v.string(),
    restaurantName: v.string(),
    location: v.optional(v.string()),
    photoStorageId: v.optional(v.id("_storage")),
    notes: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    visitedAt: v.number(),
    taste: v.number(),
    freshness: v.number(),
    presentation: v.number(),
    sides: v.number(),
    doneness: v.number(),
    value: v.number(),
  },
  handler: async (ctx, { id, userId, ...fields }) => {
    const existing = await ctx.db.get(id);
    if (!existing || existing.userId !== userId) throw new Error("Unauthorized");

    const totalScore =
      (fields.taste + fields.freshness + fields.presentation + fields.sides + fields.doneness + fields.value) / 6;

    let photoUrl = existing.photoUrl;
    if (fields.photoStorageId && fields.photoStorageId !== existing.photoStorageId) {
      photoUrl = (await ctx.storage.getUrl(fields.photoStorageId)) ?? undefined;
    }

    await ctx.db.patch(id, {
      ...fields,
      photoUrl,
      totalScore: Math.round(totalScore * 10) / 10,
    });
  },
});

export const remove = mutation({
  args: { id: v.id("burgerLogs"), userId: v.string() },
  handler: async (ctx, { id, userId }) => {
    const existing = await ctx.db.get(id);
    if (!existing || existing.userId !== userId) throw new Error("Unauthorized");
    await ctx.db.delete(id);
  },
});

export const listByFollowing = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const follows = await ctx.db
      .query("follows")
      .withIndex("by_follower", (q) => q.eq("followerId", userId))
      .collect();

    if (follows.length === 0) return [];

    const burgersByUser = await Promise.all(
      follows.map(({ followingId }) =>
        ctx.db
          .query("burgerLogs")
          .withIndex("by_user", (q) => q.eq("userId", followingId))
          .order("desc")
          .take(20)
      )
    );

    return burgersByUser
      .flat()
      .sort((a, b) => b.visitedAt - a.visitedAt)
      .slice(0, 50);
  },
});

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});
