import prisma from "../../../shared/prisma";
import bcrypt from "bcrypt";
import axios from "axios";
import jwt from "jsonwebtoken";

const createUser = async (payload: any) => {
  const existing = await prisma.user.findUnique({ where: { email: payload.email } });
  if (existing) {
    throw new Error("Email already exists");
  }

  if (payload.password !== payload.confirm_password) {
    throw new Error("Passwords do not match");
  }

  const hashedPassword = await bcrypt.hash(payload.password, 10);

  const result = await prisma.user.create({
    data: {
      first_name: payload.first_name,
      last_name: payload.last_name,
      email: payload.email,
      password: hashedPassword
    },
  });

  return result;
};

const verifyGoogleLogin = async (idToken: string) => {
  const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
  const ACCESS_SECRET = process.env.ACCESS_SECRET!;
  const REFRESH_SECRET = process.env.REFRESH_SECRET!;

  const googleRes = await axios.get(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`
    );

    const { aud, sub, email, name, picture } = googleRes.data;

    if (aud !== GOOGLE_CLIENT_ID) {
      throw new Error("Invalid Google Client ID");
    }

    // Here, you can find or create your user in DB
    // For example:
    // let user = await prisma.user.findUnique({ where: { email } });
    // if (!user) { user = await prisma.user.create({ data: { email, name, picture } }); }

    // For example purpose:
    const user = { id: sub, email, name, picture };

    // Create your own tokens
    const accessToken = jwt.sign(
      { userId: user.id, email: user.email },
      ACCESS_SECRET,
      { expiresIn: "1h" }
    );

    const refreshToken = jwt.sign(
      { userId: user.id, email: user.email },
      REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    return {
      user,
      accessToken,
      refreshToken,
    };
}

// const GoogleAuthService = {
//   async verifyGoogleLogin(idToken: string) {
    
//   },
// };



// const getAllUser = async (params: any, options: IPaginationOptions) => {
//   const { searchTerm, ...filterData } = params;
//   const { page, limit, skip, sortBy, sortOrder } = calculatePagination(options);

//   const andConditions: Prisma.UserWhereInput[] = [];

//   if (params.searchTerm) {
//     andConditions.push({
//       OR: userSearchableFileds.map((field) => ({
//         [field]: {
//           contains: params.searchTerm,
//           mode: "insensitive",
//         },
//       })),
//     });
//   }

//   //console.dir(andConditions, { depth: Infinity });
//   if (Object.keys(filterData).length > 0) {
//     console.dir(Object.keys(filterData), { depth: Infinity });

//     andConditions.push({
//       AND: Object.keys(filterData).map((key) => {
//         // Debugging logs
//         console.log("Filter Data:", filterData);
//         console.log("Accessing key:", key, "Value:", (filterData as any)[key]);

//         return {
//           [key]: {
//             equals: (filterData as any)[key],
//           },
//         };
//       }),
//     });
//   }

//   const whereConditions: Prisma.UserWhereInput =
//     andConditions.length > 0 ? { AND: andConditions } : {};

//   const result = await prisma.user.findMany({
//     where: whereConditions,
//     skip,
//     take: limit,
//     orderBy:
//       options.sortBy && options.sortOrder
//         ? {
//             [options.sortBy]: options.sortOrder,
//           }
//         : {
//             createdAt: "desc",
//           },
//     select: {
//       id: true,
//       email: true,
//       role: true,
//       needPasswordChange: true,
//       status: true,
//       createdAt: true,
//       updatedAt: true,
//       userProfile: true,
//     },
//   });

//   const total = await prisma.user.count({
//     where: whereConditions,
//   });

//   return {
//     meta: {
//       page,
//       limit,
//       total,
//     },
//     data: result,
//   };
// };

// const updateUserStatus = async (id: string, data: { status: UserStatus }) => {
//   await prisma.user.findUniqueOrThrow({
//     where: {
//       id: id,
//     },
//   });

//   const result = await prisma.user.update({
//     where: {
//       id: id,
//     },
//     data: {
//       status: data.status,
//     },
//   });

//   return result;
// };

// const updateUserRole = async (id: string, data: { role: UserRole }) => {
//   await prisma.user.findUniqueOrThrow({
//     where: {
//       id: id,
//     },
//   });

//   const result = await prisma.user.update({
//     where: {
//       id: id,
//     },
//     data: {
//       role: data.role,
//     },
//   });

//   return result;
// };

// const getMyProfile = async (user: IAuthUser) => {
//   const userInfo = await prisma.user.findUniqueOrThrow({
//     where: {
//       email: user?.email,
//     },
//     select: {
//       id: true,
//       email: true,
//       needPasswordChange: true,
//       role: true,
//       status: true,
//     },
//   });

//   let profileInfo;

//   if (userInfo.role === UserRole.SUPER_ADMIN) {
//     profileInfo = await prisma.user.findUnique({
//       where: {
//         email: userInfo.email,
//       },
//     });
//   } else if (userInfo.role === UserRole.ADMIN) {
//     profileInfo = await prisma.user.findUnique({
//       where: {
//         email: userInfo.email,
//       },
//     });
//   } else if (userInfo.role === UserRole.USER) {
//     profileInfo = await prisma.user.findUnique({
//       where: {
//         email: userInfo.email,
//       },
//     });
//   }

//   return { ...userInfo, ...profileInfo };
// };

// const updateMyProfile = async (user: IAuthUser, req: Request) => {
//   const userInfo = await prisma.user.findUniqueOrThrow({
//     where: {
//       email: user?.email,
//       status: UserStatus.ACTIVE,
//     },
//     include: {
//       userProfile: true,
//     },
//   });

//   const file = req.file as IFile;

//   if (file) {
//     const uploadToCloudinary = await fileUploader.uploadToCloudinary(file);
//     req.body.profilePhoto = uploadToCloudinary?.secure_url;
//   }

//   const { name, contactNumber, profilePhoto } = req.body;

//   const updatedProfile = await prisma.userProfile.update({
//     where: {
//       email: userInfo.email,
//     },
//     data: {
//       ...(name && { name }),
//       ...(contactNumber && { contactNumber }),
//       ...(profilePhoto && { profilePhoto }),
//     },
//   });

//   return updatedProfile;
// };

// const deleteUser = async (id: string): Promise<User> => {
//   const existUser = await prisma.user.findUnique({
//     where: { id },
//     include: { userProfile: true },
//   });

//   if (!existUser) {
//     throw new CustomApiError(httpStatus.NOT_FOUND, "User not found");
//   }

//   const userEmail = existUser.email;

//   const deletedUser = await prisma.$transaction(async (txClient) => {
//     const profile = await txClient.userProfile.findUnique({
//       where: { email: userEmail },
//     });

//     if (profile) {
//       await txClient.userProfile.delete({ where: { email: userEmail } });
//     }

//     return await txClient.user.delete({ where: { id } });
//   });

//   return deletedUser;
// };

export const UserService = {
  createUser,
  verifyGoogleLogin
};
