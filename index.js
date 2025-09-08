const express = require('express');
const morgan = require('morgan');
const app = express();
const dotenv = require("dotenv");
const connectDB = require("./src/config/db");
const route = require("./src/routes/client/index.route");
const cookieParser = require('cookie-parser');
const cors = require("cors");
const errorHandler = require("./src/middlewares/error.middleware");
const PORT = 3001;

const http = require("http");
const { initSocket } = require("./src/config/socket");

dotenv.config();

app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

app.use(morgan('combined'))
app.use(express.json());
app.use(cookieParser());
connectDB();
route(app);
app.use(errorHandler);
const server = http.createServer(app);
initSocket(server);
server.listen(PORT,'0.0.0.0', () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});