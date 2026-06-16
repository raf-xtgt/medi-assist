import { Pool, ClientBase } from 'pg'
import { Signer } from '@aws-sdk/rds-signer'
import { awsCredentialsProvider } from '@vercel/functions/oidc'
import { attachDatabasePool } from '@vercel/functions'

const signer = new Signer({
  credentials: awsCredentialsProvider({
    roleArn: process.env.AWS_ROLE_ARN!,
    clientConfig: { region: process.env.AWS_REGION },
  }),
  region: process.env.AWS_REGION!,
  hostname: process.env.PGHOST!,
  username: process.env.PGUSER || 'postgres',
  port: 5432,
})

const pool = new Pool({
  host: process.env.PGHOST,
  database: process.env.PGDATABASE || 'postgres',
  port: 5432,
  user: process.env.PGUSER || 'postgres',
  // Auth token is valid for up to 15 minutes; the lambda function will cache it.
  password: () => signer.getAuthToken(),
  ssl: { rejectUnauthorized: false },
  // Pool optimisation for Aurora PostgreSQL (serverless-friendly defaults)
  max: 20,               // maximum concurrent connections
  min: 2,                // keep warm connections ready
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  allowExitOnIdle: true,
})

attachDatabasePool(pool)

/** Execute a single parameterised query. */
export async function query(text: string, params?: unknown[]) {
  return pool.query(text, params)
}

/** Use for multi-statement transactions that need a dedicated client. */
export async function withConnection<T>(
  fn: (client: ClientBase) => Promise<T>,
): Promise<T> {
  const client = await pool.connect()
  try {
    return await fn(client)
  } finally {
    client.release()
  }
}
