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
    // Ratings 1-5
    taste: v.number(),
    freshness: v.number(),
    presentation: v.number(),
    sides: v.number(),
    doneness: v.number(),
    value: v.number(),
    // Computed average
    totalScore: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_visited", ["visitedAt"]),
});
