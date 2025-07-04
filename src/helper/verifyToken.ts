import jwt from "jsonwebtoken";
import config from "../config";

export interface DecodedToken extends jwt.JwtPayload {
  userId?: string;
  id?: string; 
  email?: string;
  role?: string;
}


export const verifyToken = (token: string): DecodedToken => {
  if (!config.jwt.access_secret) {
    throw new Error("JWT secret is not configured");
  }

  try {
    const decoded = jwt.verify(token, config.jwt.access_secret) as DecodedToken;

    if (!decoded.userId && !decoded.id) {
      throw new Error("Token must contain either 'userId' or 'id' field");
    }

    return {
      ...decoded,
      userId: decoded.userId || decoded.id,
    };
  } catch (error: any) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error("Token expired");
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new Error("Invalid token");
    }

    throw error; 
  }
};
