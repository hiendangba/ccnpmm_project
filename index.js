const express = require('express');
const morgan = require('morgan');
const app = express();
const dotenv = require("dotenv");
const connectDB = require("./src/config/db");
const authRoute = require('./src/routes/auth.routes');
const cookieParser = require('cookie-parser');
const cors = require("cors");
const PORT = 3000;
dotenv.config();
app.use(morgan('combined'))
app.use(express.json());
app.use(cookieParser());
connectDB();
app.use(cors({
  origin: "http://localhost:5173", // cho phép frontend gọi
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use('/api/auth', authRoute); // tất cả route auth nằm trong /api/auth
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});