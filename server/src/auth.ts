/**
 * Admin JWT helpers: credentials from env, sign tokens, protect write routes.
 */
import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev-jwt-secret-change-me";
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin";
const TOKEN_EXPIRES_IN = "7d";

export function credentialsMatch(
  username: unknown,
  password: unknown,
): boolean {
  return (
    typeof username === "string" &&
    typeof password === "string" &&
    username === ADMIN_USERNAME &&
    password === ADMIN_PASSWORD
  );
}

export function signAdminToken(username: string): string {
  return jwt.sign({ sub: username, role: "admin" }, JWT_SECRET, {
    expiresIn: TOKEN_EXPIRES_IN,
  });
}

/** Require Authorization: Bearer <jwt> on protected routes. */
export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized. Sign in required." });
    return;
  }

  const token = header.slice("Bearer ".length).trim();
  if (!token) {
    res.status(401).json({ error: "Unauthorized. Sign in required." });
    return;
  }

  try {
    jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token." });
  }
}
