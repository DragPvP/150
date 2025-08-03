import { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { desc, eq } from 'drizzle-orm';
import { z } from 'zod';

// Database schema (inline for Vercel compatibility)
import { pgTable, serial, text, decimal, timestamp, boolean, uuid as pgUuid } from 'drizzle-orm/pg-core';

const presales = pgTable("presales", {
  id: pgUuid("id").primaryKey().defaultRandom(),
  totalRaised: decimal("total_raised", { precision: 20, scale: 8 }).notNull().default("0"),
  totalSupply: decimal("total_supply", { precision: 20, scale: 8 }).notNull().default("200000"),
  currentRate: decimal("current_rate", { precision: 20, scale: 8 }).notNull().default("65.00000000"),
  stageEndTime: timestamp("stage_end_time").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

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

// Validation schema
const insertTransactionSchema = z.object({
  walletAddress: z.string().min(1),
  currency: z.string().min(1),
  payAmount: z.string().min(1),
  receiveAmount: z.string().min(1),
  referralCode: z.string().nullable(),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === 'POST') {
      // Create a new transaction
      const validationResult = insertTransactionSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({
          message: "Invalid transaction data",
          errors: validationResult.error.errors
        });
      }

      const transactionData = validationResult.data;

      // Insert the transaction
      const [newTransaction] = await db.insert(transactions).values({
        walletAddress: transactionData.walletAddress,
        currency: transactionData.currency,
        payAmount: transactionData.payAmount,
        receiveAmount: transactionData.receiveAmount,
        referralCode: transactionData.referralCode,
        status: 'pending'
      }).returning();

      // Update presale total raised amount (convert receiveAmount to USDT equivalent)
      const receiveAmountNum = parseFloat(transactionData.receiveAmount.replace(/,/g, ''));
      const rate = 65; // 1 USDT = 65 PEPEWUFF
      const usdtEquivalent = receiveAmountNum / rate;

      // Get current presale data
      const [currentPresale] = await db.select().from(presales).limit(1);
      
      if (currentPresale) {
        const currentRaised = parseFloat(currentPresale.totalRaised);
        const newTotalRaised = currentRaised + usdtEquivalent;
        
        await db.update(presales)
          .set({ 
            totalRaised: newTotalRaised.toFixed(2),
            updatedAt: new Date()
          })
          .where(eq(presales.id, currentPresale.id));
      }

      res.status(201).json(newTransaction);
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