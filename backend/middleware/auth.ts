import jwt from "jsonwebtoken"
import { Request, Response, NextFunction } from "express"

export default function auth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization || ""
  const bearer = header.startsWith("Bearer ") ? header.slice(7) : null
  const cookieToken = (req as any).cookies?.token || null
  const token = bearer || cookieToken
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" })
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: number; role: string }
    ;(req as any).userId = payload.userId
    ;(req as any).userRole = payload.role
    next()
  } catch {
    return res.status(401).json({ message: "Unauthorized" })
  }
}
