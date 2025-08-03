import { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { desc, eq } from 'drizzle-orm';

// Database schema (inline for Vercel compatibility)
import { pgTable, text, varchar, decimal, timestamp } from 'drizzle-orm/pg-core';
import { sql as drizzleSql } from "drizzle-orm";

const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(drizzleSql`gen_random_uuid()`),
  walletAddress: text("wallet_address").notNull(),
  currency: text("currency").notNull(),
  payAmount: decimal("pay_amount", { precision: 18, scale: 8 }).notNull(),
  receiveAmount: decimal("receive_amount", { precision: 18, scale: 2 }).notNull(),
  txHash: text("tx_hash"),
  status: text("status").notNull().default("pending"),
  referralCode: text("referral_code"),
  createdAt: timestamp("created_at").notNull().default(drizzleSql`CURRENT_TIMESTAMP`),
});

// Hardcoded database connection for Vercel deployment
const DATABASE_URL = "postgresql://pepewuff_owner:uCNIX5aBKwVx@ep-odd-darkness-a2hqr7ly.eu-central-1.aws.neon.tech/pepewuff?sslmode=require";

const sql = neon(DATABASE_URL);
const db = drizzle(sql);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === 'GET') {
      const { address } = req.query;
      
      if (!address || typeof address !== 'string') {
        return res.status(400).json({ message: 'Wallet address is required' });
      }

      // Get transactions for the specific wallet address
      const userTransactions = await db.select().from(transactions)
        .where(eq(transactions.walletAddress, address.toLowerCase()))
        .orderBy(desc(transactions.createdAt));

      res.json(userTransactions);
    } else {
      res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
}