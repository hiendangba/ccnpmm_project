const { createClient } = require("redis");

const redisClient = createClient({
  url: process.env.URL_REDIS,
  socket: {
    tls: true,              // bắt buộc với Redis Aiven
    connectTimeout: 10000,  // tăng timeout lên 10s
    keepAlive: 30000,       // gửi gói keep-alive mỗi 30s
    reconnectStrategy: retries => {
      if (retries > 10) return new Error("Retry limit reached"); // giới hạn số lần retry
      return Math.min(retries * 500, 5000); // delay tăng dần
    }
  }
});

redisClient.on("connect", () => console.log("✅ Redis connected"));
redisClient.on("ready", () => console.log("Redis ready"));
redisClient.on("reconnecting", () => console.log("Redis reconnecting..."));
redisClient.on("error", (err) => console.error("❌ Redis error", err));
redisClient.on("end", () => console.log("Redis connection closed"));

(async () => {
  try {
    await redisClient.connect();
  } catch (err) {
    console.error("Redis initial connect failed:", err);
  }
})();

module.exports = redisClient;
