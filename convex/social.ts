import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ─── Likes ────────────────────────────────────────────────────────────────────

export const toggleLike = mutation({
  args: { burgerId: v.id("burgerLogs"), userId: v.string(), userName: v.string(), userImageUrl: v.optional(v.string()) },
  handler: async (ctx, { burgerId, userId, userName, userImageUrl }) => {
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
      // Notify burger owner (not self-likes)
      if (burger.userId !== userId) {
        await ctx.db.insert("notifications", {
          userId: burger.userId,
          type: "like",
          fromUserId: userId,
          fromUserName: userName,
          fromUserImageUrl: userImageUrl,
          burgerId,
          burgerName: burger.burgerName,
          read: false,
          createdAt: Date.now(),
        });
      }
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

    // Notify burger owner (not self-comments)
    if (burger.userId !== userId) {
      await ctx.db.insert("notifications", {
        userId: burger.userId,
        type: "comment",
        fromUserId: userId,
        fromUserName: userName,
        fromUserImageUrl: userImageUrl,
        burgerId,
        burgerName: burger.burgerName,
        read: false,
        createdAt: Date.now(),
      });
    }
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
  args: { followerId: v.string(), followerName: v.string(), followerImageUrl: v.optional(v.string()), followingId: v.string() },
  handler: async (ctx, { followerId, followerName, followerImageUrl, followingId }) => {
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
      // Notify the user being followed
      await ctx.db.insert("notifications", {
        userId: followingId,
        type: "follow",
        fromUserId: followerId,
        fromUserName: followerName,
        fromUserImageUrl: followerImageUrl,
        read: false,
        createdAt: Date.now(),
      });
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

// ─── User profile ─────────────────────────────────────────────────────────────

export const getUserProfile = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const burgers = await ctx.db
      .query("burgerLogs")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();

    if (burgers.length === 0) return null;

    const latest = burgers[0];
    const totalScore = burgers.reduce((s, b) => s + b.totalScore, 0);
    const best = burgers.reduce((a, b) => (b.totalScore > a.totalScore ? b : a));

    const followers = await ctx.db
      .query("follows")
      .withIndex("by_following", (q) => q.eq("followingId", userId))
      .collect();

    const following = await ctx.db
      .query("follows")
      .withIndex("by_follower", (q) => q.eq("followerId", userId))
      .collect();

    return {
      userId,
      userName: latest.userName,
      userImageUrl: latest.userImageUrl,
      totalBurgers: burgers.length,
      avgScore: Math.round((totalScore / burgers.length) * 10) / 10,
      bestScore: best.totalScore,
      followers: followers.length,
      following: following.length,
      burgers,
    };
  },
});
