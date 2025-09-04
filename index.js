const express = require('express');
const morgan = require('morgan');
const app = express();
const dotenv = require("dotenv");
const connectDB = require("./src/config/db");
const authRoute = require('./src/routes/auth.routes');
const userRoute = require('./src/routes/user.route');
const cookieParser = require('cookie-parser');
const cors = require("cors");
const PORT = 3000;
dotenv.config();
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(morgan('combined'))
app.use(express.json());
app.use(cookieParser());
connectDB();
app.use('/api/auth', authRoute);
app.use('/api/user', userRoute);
app.listen(PORT,'0.0.0.0', () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});