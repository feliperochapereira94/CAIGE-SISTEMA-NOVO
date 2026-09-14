import jwt from "jsonwebtoken";

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "8h";
const JWT_SECRET = process.env.JWT_SECRET || "caige-dev-secret-change-in-production";

export function signAccessToken(payload) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    issuer: "caige-api"
  });
}

export function verifyAccessToken(token) {
  return jwt.verify(token, JWT_SECRET, {
    issuer: "caige-api"
  });
}

export function getTokenTtl() {
  return JWT_EXPIRES_IN;
}

