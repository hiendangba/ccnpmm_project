const express = require('express');
const morgan = require('morgan');
const app = express();
const dotenv = require("dotenv");
const connectDB = require("./src/config/db");
const authRoute = require('./src/routes/auth.routes');
const PORT = 3000;
dotenv.config();
app.use(morgan('combined'))
app.use(express.json());
connectDB();
app.use('/api/auth', authRoute); // tất cả route auth nằm trong /api/auth
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});