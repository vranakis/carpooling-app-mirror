import { Pool } from "@neondatabase/serverless";

let pool: Pool | null = null;

export function getNeonPool() {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
      throw new Error(
        "❌ DATABASE_URL environment variable is not set.\n" +
          "Please add it to your .env.local file.\n" +
          "Get it from: https://console.neon.tech"
      );
    }

    pool = new Pool({ connectionString });
  }

  return pool;
}

// Helper function for raw SQL queries
export async function queryNeon<T = any>(
  sql: string,
  params: any[] = []
): Promise<T[]> {
  const pool = getNeonPool();

  try {
    const result = await pool.query(sql, params);
    return result.rows as T[];
  } catch (error: any) {
    console.error("❌ Database query error:", error.message);
    throw error;
  }
}

// Helper for single row queries
export async function queryNeonSingle<T = any>(
  sql: string,
  params: any[] = []
): Promise<T | null> {
  const results = await queryNeon<T>(sql, params);
  return results[0] || null;
}

// Test connection
export async function testConnection(): Promise<boolean> {
  try {
    const result = await queryNeon(
      "SELECT NOW() as time, version() as version"
    );
    console.log("✅ Database connected:", result[0].time);
    return true;
  } catch (error) {
    console.error("❌ Database connection failed");
    return false;
  }
}
