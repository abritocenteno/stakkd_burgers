import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query("wishlist")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

export const add = mutation({
  args: {
    userId: v.string(),
    burgerName: v.string(),
    restaurantName: v.string(),
    location: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("wishlist", { ...args, addedAt: Date.now() });
  },
});

export const remove = mutation({
  args: { id: v.id("wishlist"), userId: v.string() },
  handler: async (ctx, { id, userId }) => {
    const item = await ctx.db.get(id);
    if (!item || item.userId !== userId) throw new Error("Unauthorized");
    await ctx.db.delete(id);
  },
});
