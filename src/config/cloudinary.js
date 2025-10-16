const cloudinary = require("cloudinary").v2;

const https = require("https");
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
  http_agent: new https.Agent({
    keepAlive: true,
    timeout: 120000, // chờ tối đa 60s trước khi reset
  }),
});

module.exports = cloudinary;