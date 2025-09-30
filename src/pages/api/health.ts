import type { NextApiRequest, NextApiResponse } from 'next'

type Data = {
  status: 'ok'
  timestamp: string
  commit: string | null
  branch: string | null
}

export default function handler(
  _req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    commit: process.env.VERCEL_GIT_COMMIT_SHA || null,
    branch: process.env.VERCEL_GIT_COMMIT_REF || null,
  })
}
