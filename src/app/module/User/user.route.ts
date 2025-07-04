import express from "express";
import { UserControllers } from "./user.controller";

const route = express.Router();

route.post("/register", UserControllers.createUserIntoDB)

route.post("/google-login", UserControllers.googleLogin);

// route.post(
//   "/create-user",
//   fileUploader.upload.single("file"),
//   (req: Request, res: Response, next: NextFunction) => {
//     req.body = UserValidation.createUser.parse(JSON.parse(req.body.data));
//     return UserControllers.createUserIntoDB(req, res);
//   }
// );

// route.patch(
//   "/:id/status",
//   auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
//   UserControllers.updateUserStatusIntoDB
// );

// route.patch(
//   "/:id/role",
//   auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
//   UserControllers.updateUserRoleIntoDB
// );

// route.get(
//   "/me",
//   auth(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.USER),
//   UserControllers.getMyProfileFromDB
// );

// route.patch(
//   "/update-my-profile",
//   auth(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.USER),
//   fileUploader.upload.single("file"),
//   (req: Request, res: Response, next: NextFunction) => {
//     req.body = JSON.parse(req.body.data);
//     return UserControllers.updateMyProfileIntoDB(req, res, next);
//   }
// );

// route.delete("/delete/:id", UserControllers.deleteUser)

export const userRoute = route;
