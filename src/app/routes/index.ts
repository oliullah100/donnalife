import express from 'express'
import { userRoute } from '../module/User/user.route';
import { AuthRoute } from '../module/Auth/auth.route';

const route = express.Router()

const moduleRoutes = [
    {
        path: "/user",
        route: userRoute,
    },
    {
        path: "/auth",
        route: AuthRoute,
    }
]

moduleRoutes.forEach((router) => route.use(router.path, router.route));

export default route;