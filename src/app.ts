import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { config } from "./app/config";
import { appRoutes } from "./app/routes";
import { globalErrorHandler } from "./app/middlewares/globalErrorHandler";
import { notFound } from "./app/middlewares/notFound";

const app: Application = express();

app.use(helmet());
app.use(morgan("dev"));
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: [
      config.clientUrl,
      "http://localhost:3000",
      "https://harmony-three-blond.vercel.app",
    ],
    credentials: true,
  }),
);

app.get("/", (req, res) => {
  res.json({ success: true, message: "Harmony 360 backend is running" });
});

app.use("/api/v1", appRoutes);
app.use(notFound);
app.use(globalErrorHandler);

export default app;
