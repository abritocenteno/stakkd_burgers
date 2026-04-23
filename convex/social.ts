import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ─── Likes ────────────────────────────────────────────────────────────────────

export const toggleLike = mutation({
  args: { burgerId: v.id("burgerLogs"), userId: v.string() },
  handler: async (ctx, { burgerId, userId }) => {
    const existing = await ctx.db
      .query("likes")
      .withIndex("by_burger_user", (q) => q.eq("burgerId", burgerId).eq("userId", userId))
      .unique();

    const burger = await ctx.db.get(burgerId);
    if (!burger) throw new Error("Burger not found");

    if (existing) {
      await ctx.db.delete(existing._id);
      await ctx.db.patch(burgerId, { likeCount: Math.max(0, (burger.likeCount ?? 0) - 1) });
      return false;
    } else {
      await ctx.db.insert("likes", { burgerId, userId });
      await ctx.db.patch(burgerId, { likeCount: (burger.likeCount ?? 0) + 1 });
      return true;
    }
  },
});

export const getUserLike = query({
  args: { burgerId: v.id("burgerLogs"), userId: v.string() },
  handler: async (ctx, { burgerId, userId }) => {
    const like = await ctx.db
      .query("likes")
      .withIndex("by_burger_user", (q) => q.eq("burgerId", burgerId).eq("userId", userId))
      .unique();
    return !!like;
  },
});

// ─── Comments ─────────────────────────────────────────────────────────────────

export const listComments = query({
  args: { burgerId: v.id("burgerLogs") },
  handler: async (ctx, { burgerId }) => {
    return await ctx.db
      .query("comments")
      .withIndex("by_burger_created", (q) => q.eq("burgerId", burgerId))
      .order("asc")
      .collect();
  },
});

export const addComment = mutation({
  args: {
    burgerId: v.id("burgerLogs"),
    userId: v.string(),
    userName: v.string(),
    userImageUrl: v.optional(v.string()),
    text: v.string(),
  },
  handler: async (ctx, { burgerId, userId, userName, userImageUrl, text }) => {
    const burger = await ctx.db.get(burgerId);
    if (!burger) throw new Error("Burger not found");

    await ctx.db.insert("comments", {
      burgerId,
      userId,
      userName,
      userImageUrl,
      text: text.trim(),
      createdAt: Date.now(),
    });

    await ctx.db.patch(burgerId, { commentCount: (burger.commentCount ?? 0) + 1 });
  },
});

export const deleteComment = mutation({
  args: { commentId: v.id("comments"), userId: v.string() },
  handler: async (ctx, { commentId, userId }) => {
    const comment = await ctx.db.get(commentId);
    if (!comment || comment.userId !== userId) throw new Error("Unauthorized");

    await ctx.db.delete(commentId);

    const burger = await ctx.db.get(comment.burgerId);
    if (burger) {
      await ctx.db.patch(comment.burgerId, {
        commentCount: Math.max(0, (burger.commentCount ?? 0) - 1),
      });
    }
  },
});

// ─── Follows ──────────────────────────────────────────────────────────────────

export const toggleFollow = mutation({
  args: { followerId: v.string(), followingId: v.string() },
  handler: async (ctx, { followerId, followingId }) => {
    if (followerId === followingId) throw new Error("Cannot follow yourself");

    const existing = await ctx.db
      .query("follows")
      .withIndex("by_follower_following", (q) =>
        q.eq("followerId", followerId).eq("followingId", followingId)
      )
      .unique();

    if (existing) {
      await ctx.db.delete(existing._id);
      return false;
    } else {
      await ctx.db.insert("follows", { followerId, followingId });
      return true;
    }
  },
});

export const isFollowing = query({
  args: { followerId: v.string(), followingId: v.string() },
  handler: async (ctx, { followerId, followingId }) => {
    if (followerId === followingId) return false;
    const existing = await ctx.db
      .query("follows")
      .withIndex("by_follower_following", (q) =>
        q.eq("followerId", followerId).eq("followingId", followingId)
      )
      .unique();
    return !!existing;
  },
});

export const getFollowCounts = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const followers = await ctx.db
      .query("follows")
      .withIndex("by_following", (q) => q.eq("followingId", userId))
      .collect();

    const following = await ctx.db
      .query("follows")
      .withIndex("by_follower", (q) => q.eq("followerId", userId))
      .collect();

    return { followers: followers.length, following: following.length };
  },
});
