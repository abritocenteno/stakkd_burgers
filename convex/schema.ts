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
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
    photoStorageId: v.optional(v.id("_storage")),
    photoUrl: v.optional(v.string()),
    notes: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    visitedAt: v.number(),
    taste: v.number(),
    freshness: v.number(),
    presentation: v.number(),
    sides: v.number(),
    doneness: v.number(),
    value: v.number(),
    totalScore: v.number(),
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

  notifications: defineTable({
    userId: v.string(),
    type: v.union(v.literal("like"), v.literal("comment"), v.literal("follow")),
    fromUserId: v.string(),
    fromUserName: v.string(),
    fromUserImageUrl: v.optional(v.string()),
    burgerId: v.optional(v.id("burgerLogs")),
    burgerName: v.optional(v.string()),
    read: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_read", ["userId", "read"]),

  wishlist: defineTable({
    userId: v.string(),
    burgerName: v.string(),
    restaurantName: v.string(),
    location: v.optional(v.string()),
    notes: v.optional(v.string()),
    addedAt: v.number(),
  })
    .index("by_user", ["userId"]),
});
