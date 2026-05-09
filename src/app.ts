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

const allowedOrigins = [
  config.clientUrl,
  "http://localhost:3001",
  "http://206.162.244.175:3000",
  "https://harmony-three-blond.vercel.app",
].filter(Boolean);

const corsOptions: cors.CorsOptions = {
  origin(origin, callback) {
    if (!origin) {
      return callback(null, true);
    }

    const isAllowed =
      allowedOrigins.includes(origin) ||
      origin.endsWith(".vercel.app");

    if (isAllowed) {
      return callback(null, true);
    }

    console.log("Blocked by CORS:", origin);
    return callback(new Error(`Not allowed by CORS: ${origin}`));
  },
  // credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

// CORS must be before routes
app.use(cors(corsOptions));

app.use(helmet());
app.use(morgan("dev"));
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Harmony 360 backend is running",
    allowedOrigins,
  });
});

app.use("/api/v1", appRoutes);

app.use(notFound);
app.use(globalErrorHandler);

export default app;