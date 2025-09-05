const multer = require("multer");

const storage = multer.memoryStorage(); // lưu tạm vào RAM
const upload = multer({ storage });

module.exports = upload;