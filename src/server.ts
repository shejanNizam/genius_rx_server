/* eslint-disable no-console */
import http, { Server } from "http";
import mongoose from "mongoose";
import app from "./app";
import { configs } from "./app/config/index";
import { connectRedis, redisClient } from "./app/config/redis.config";
import { seedAdmin } from "./app/utils/seedAdmin";
import { seedSuperAdmin } from "./app/utils/seedSuperAdmin";
import { initSocket } from "./socket/socket";

let server: Server;

async function main() {
  try {
    await mongoose.connect(configs.database_url);
    console.log("Connected to DB!");

    await connectRedis();
    await seedSuperAdmin();
    await seedAdmin();

    if (configs.node_env !== "production") {
      const httpServer = http.createServer(app);
      await initSocket(httpServer);

      server = httpServer.listen(configs.port, () => {
        console.log(`Genius Rx Server is running on port ${configs.port}`);
      });
    }
  } catch (error) {
    console.log(error);
  }
}
main();

// Graceful shutdown
const gracefulShutdown = async (signal: string, exitCode: number) => {
  console.log(`${signal} received... shutting down gracefully`);
  if (server) {
    server.close(async () => {
      await mongoose.connection.close();
      await redisClient.quit();
      console.log("Server closed.");
      process.exit(exitCode);
    });
  } else {
    process.exit(exitCode);
  }
};

// intentional shutdowns — exit(0)
process.on("SIGTERM", () => gracefulShutdown("SIGTERM", 0));
process.on("SIGINT", () => gracefulShutdown("SIGINT", 0));

// unexpected errors — exit(1)
process.on("unhandledRejection", (err) => {
  console.log("Unhandled Rejection detected...", err);
  gracefulShutdown("unhandledRejection", 1);
});
// Promise.reject(new Error("I forgot to catch this promise"));

process.on("uncaughtException", (err) => {
  console.log("Uncaught Exception detected...", err);
  gracefulShutdown("uncaughtException", 1);
});
// throw new Error("I forgot to handle this local error")

// Vercel reads this export to serve the app as a serverless function.
export default app;
