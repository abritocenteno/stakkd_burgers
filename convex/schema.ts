import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  burgerLogs: defineTable({
    userId: v.string(),
    userName: v.string(),
    userImageUrl: v.optional(v.string()),
    burgerName: v.string(),
    restaurantName: v.string(),
    location: v.optional(v.string()),
    photoStorageId: v.optional(v.id("_storage")),
    photoUrl: v.optional(v.string()),
    notes: v.optional(v.string()),
    visitedAt: v.number(),
    taste: v.number(),
    freshness: v.number(),
    presentation: v.number(),
    sides: v.number(),
    doneness: v.number(),
    value: v.number(),
    totalScore: v.number(),
    // Denormalized counts for feed display without N+1 queries
    likeCount: v.optional(v.number()),
    commentCount: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_visited", ["visitedAt"]),

  likes: defineTable({
    burgerId: v.id("burgerLogs"),
    userId: v.string(),
  })
    .index("by_burger", ["burgerId"])
    .index("by_burger_user", ["burgerId", "userId"]),

  comments: defineTable({
    burgerId: v.id("burgerLogs"),
    userId: v.string(),
    userName: v.string(),
    userImageUrl: v.optional(v.string()),
    text: v.string(),
    createdAt: v.number(),
  })
    .index("by_burger", ["burgerId"])
    .index("by_burger_created", ["burgerId", "createdAt"]),

  follows: defineTable({
    followerId: v.string(),
    followingId: v.string(),
  })
    .index("by_follower", ["followerId"])
    .index("by_following", ["followingId"])
    .index("by_follower_following", ["followerId", "followingId"]),
});
