import express, { Application, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import route from "./app/routes";
import globalErrorHandler from "./app/middlewares/globalErrorHandler";
import notFoundError from "./app/middlewares/notFoundError";

const app: Application = express();

app.use(
  cors({
    origin: ["http://localhost:5173", "https://brundagowrav-red.vercel.app", "file:///D:/oli-ullah/donnalife1/frontend/index.html"],
    credentials: true,
  })
);

app.use(cookieParser());
dotenv.config();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.get("/", (req: Request, res: Response) => {
  res.send({
    Message: "Donna life server is running successfully!!!",
  });
});

app.use("/api", route);

app.use(globalErrorHandler);

app.use(notFoundError);

export default app;
