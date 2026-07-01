import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Application, Request, Response } from "express";
import expressSession from "express-session";
import helmet from "helmet";
import morgan from "morgan";
import passport from "passport";
import { configs } from "./app/config/index";
import "./app/config/passport";
import { globalErrorHandler } from "./app/middlewares/globalErrorHandler";
import notFound from "./app/middlewares/notFound";
import router from "./app/routes/index";

const app: Application = express();

app.use(helmet()); // security
app.use(morgan(configs.node_env === "production" ? "combined" : "dev")); // logging

// Stripe webhook needs the raw request body to verify the signature — this must
// run before express.json() below, and is the only place raw-body parsing happens
// for this route (do not duplicate it in subscription.route.ts).
app.use(
  "/api/v1/subscription/webhook",
  express.raw({ type: "application/json" }),
);

// parsers
app.use(express.json());
app.set("trust proxy", 1); // trust first proxy for secure cookies in production
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: configs.frontend_url === "*" ? true : configs.frontend_url,
    credentials: configs.frontend_url !== "*",
  }),
);
app.use(
  expressSession({
    secret: configs.express_session_secret,
    resave: false,
    saveUninitialized: false,
  }),
);
app.use(passport.initialize());
app.use(passport.session());

// application routes
app.use("/api/v1", router);

const test = (req: Request, res: Response) => {
  res.send(`Hello from Genius Rx Server`);
};
app.get(`/`, test);

// global error handler
app.use(globalErrorHandler);

// not found handler
app.use(notFound);

export default app;
