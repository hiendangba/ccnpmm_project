const { createClient } = require("redis");

const redisClient = createClient({
  url: process.env.URL_REDIS,
});

redisClient.on("error", (err) => console.error("❌ Redis error", err));

(async () => {
  try {
    await redisClient.connect();
  } catch (err) {
  }
})();

module.exports = redisClient;