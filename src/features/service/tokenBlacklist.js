import jwt from "jsonwebtoken";

const tokenBlacklist = new Set();

export function isTokenBlacklisted(token) {
  return tokenBlacklist.has(token);
}

export function blacklistToken(token) {
  tokenBlacklist.add(token);
  const decoded = jwt.decode(token);
  if (decoded?.exp) {
    const ttl = decoded.exp * 1000 - Date.now();
    if (ttl > 0) {
      setTimeout(() => tokenBlacklist.delete(token), ttl);
    }
  }
}
