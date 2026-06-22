/* eslint-disable no-console */
import { createClient } from "redis";
import { configs } from "./index";

export const redisClient = createClient({
  username: configs.REDIS.redis_username,
  password: configs.REDIS.redis_password,
  socket: {
    host: configs.REDIS.redis_host,
    port: parseInt(configs.REDIS.redis_port),
  },
});

redisClient.on("error", (err) => console.log("Redis Client Error", err));

// await redisClient.set("foo", "bar");
// const result = await redisClient.get("foo");
// console.log(result); // >>> bar

export const connectRedis = async () => {
  if (!redisClient.isOpen) {
    await redisClient.connect();
    console.log("Redis Connected!");
  }
};
