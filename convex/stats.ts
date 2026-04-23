import { query } from "./_generated/server";

export const getBurgerOfTheMonth = query({
  args: {},
  handler: async (ctx) => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    const burgers = await ctx.db
      .query("burgerLogs")
      .withIndex("by_visited", (q) => q.gte("visitedAt", startOfMonth))
      .collect();

    if (burgers.length === 0) return null;

    return burgers.reduce((best, b) => (b.totalScore > best.totalScore ? b : best));
  },
});

export const getLeaderboard = query({
  args: {},
  handler: async (ctx) => {
    const allBurgers = await ctx.db.query("burgerLogs").collect();

    const userMap = new Map<
      string,
      {
        userId: string;
        userName: string;
        userImageUrl: string | undefined;
        totalBurgers: number;
        scoreSum: number;
      }
    >();

    for (const burger of allBurgers) {
      const entry = userMap.get(burger.userId);
      if (entry) {
        entry.totalBurgers++;
        entry.scoreSum += burger.totalScore;
        // Keep the most recent userName/image in case they updated their profile
        entry.userName = burger.userName;
        entry.userImageUrl = burger.userImageUrl;
      } else {
        userMap.set(burger.userId, {
          userId: burger.userId,
          userName: burger.userName,
          userImageUrl: burger.userImageUrl,
          totalBurgers: 1,
          scoreSum: burger.totalScore,
        });
      }
    }

    return Array.from(userMap.values())
      .map((u) => ({
        userId: u.userId,
        userName: u.userName,
        userImageUrl: u.userImageUrl,
        totalBurgers: u.totalBurgers,
        avgScore: Math.round((u.scoreSum / u.totalBurgers) * 10) / 10,
      }))
      .sort((a, b) => b.avgScore - a.avgScore || b.totalBurgers - a.totalBurgers)
      .slice(0, 10);
  },
});
