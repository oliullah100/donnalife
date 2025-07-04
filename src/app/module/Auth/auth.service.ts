import { createToken } from "../../../helper/jsonWebToken";
import prisma from "../../../shared/prisma";
import bcrypt from "bcrypt";

const loginUser = async (payload: any) => {
  const { email, password } = payload;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error("Invalid email or password");
  }

  const passwordMatch = await bcrypt.compare(password, user.password);

  if (!passwordMatch) {
    throw new Error("Invalid email or password");
  }

 const accessToken = createToken(
    user.id,
    user.email,
    user.role,
    process.env.ACCESS_SECRET as string,
    900000
  );

  const refreshToken = createToken(
    user.id,
    user.email,
    user.role,
    process.env.REFRESH_SECRET as string,
    172800000
  );

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      role: user.role,
    },
  };
};

export const AuthService = { loginUser };
