import { VercelRequest, VercelResponse } from '@vercel/node';
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { desc, sql } from "drizzle-orm";
import { pgTable, varchar, decimal, timestamp, boolean } from "drizzle-orm/pg-core";

// Inline schema definition for Vercel compatibility
const presaleData = pgTable("presale_data", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  totalRaised: decimal("total_raised", { precision: 18, scale: 2 }).notNull().default("0"),
  totalSupply: decimal("total_supply", { precision: 18, scale: 2 }).notNull().default("1000000"),
  currentRate: decimal("current_rate", { precision: 18, scale: 8 }).notNull().default("47"),
  stageEndTime: timestamp("stage_end_time").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  updatedAt: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Initialize database connection with hardcoded URL
    const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_s0BuDPOJY1rN@ep-frosty-feather-ae5igo6r-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
    const sql = neon(DATABASE_URL);
    const db = drizzle(sql, { schema: { presaleData } });

    // Get presale data
    const result = await db.select().from(presaleData).orderBy(desc(presaleData.updatedAt)).limit(1);
    
    let currentPresaleData;
    if (result.length === 0) {
      // Initialize presale data if none exists
      const initialData = {
        totalRaised: "76735.34",
        totalSupply: "200000",
        currentRate: "65",
        stageEndTime: new Date(Date.now() + (3 * 24 * 60 * 60 * 1000) + (5 * 60 * 60 * 1000) + (17 * 60 * 1000) + (14 * 1000)), // 3 days, 5 hours, 17 mins, 14 secs from now
        isActive: true,
      };
      
      const created = await db.insert(presaleData).values(initialData).returning();
      currentPresaleData = created[0];
    } else {
      currentPresaleData = result[0];
    }
    
    // Calculate percentage
    const totalRaised = parseFloat(currentPresaleData.totalRaised);
    const goalAmount = parseFloat(currentPresaleData.totalSupply); // Using totalSupply field as goal amount
    const percentage = goalAmount > 0 ? (totalRaised / goalAmount) * 100 : 0;
    
    res.json({
      ...currentPresaleData,
      percentage: percentage.toFixed(2)
    });
  } catch (error) {
    console.error("Presale API error:", error);
    res.status(500).json({ message: "Failed to fetch presale data", error: error instanceof Error ? error.message : "Unknown error" });
  }
}