import { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { desc, eq } from 'drizzle-orm';

// Database schema (inline for Vercel compatibility)
import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  walletAddress: text("wallet_address").notNull(),
  currency: text("currency").notNull(),
  payAmount: text("pay_amount").notNull(),
  receiveAmount: text("receive_amount").notNull(),
  referralCode: text("referral_code"),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
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