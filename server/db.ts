import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "@shared/schema";

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_s0BuDPOJY1rN@ep-frosty-feather-ae5igo6r-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const sql = neon(DATABASE_URL);
export const db = drizzle(sql, { schema });