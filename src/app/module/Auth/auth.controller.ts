import { Request, Response } from "express";
import { AuthService } from "./auth.service";

const loginUserFromDB = async (req: Request, res: Response) => {
  try {
    const result = await AuthService.loginUser(req.body);

    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, 
    });

    res.status(200).json({
      success: true,
      message: "User logged in successfully",
      data: {
        accessToken: result.accessToken,
        user: result.user,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error?.message || "Something went wrong",
      error: error,
    });
  }
};

export const AuthController = { loginUserFromDB };
