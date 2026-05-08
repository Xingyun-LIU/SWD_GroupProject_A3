import jwt from "jsonwebtoken"
import { NextRequest } from "next/server"

const JWT_SECRET = process.env.JWT_SECRET!

export interface JwtPayload {
  userId: string
  role: string
}

export async function verifyAdmin(req: NextRequest) {
  const authHeader = req.headers.get("authorization")

  if (!authHeader) {
    throw new Error("Unauthorized")
  }

  const token = authHeader.split(" ")[1]

  const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload

  if (decoded.role !== "admin") {
    throw new Error("Forbidden")
  }

  return decoded
}