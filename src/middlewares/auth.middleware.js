const jwt = require("jsonwebtoken");
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // "Bearer token"
  if (!token) {
    return res.status(401).json({ message: "Không có token, từ chối truy cập" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // gắn user vào request
    next();
  } catch (err) {
    return res.status(403).json({ message: "Token không hợp lệ" });
  }
};

const checkPassTokenMiddleware = (req, res, next) => {
  const resetToken = req.cookies.resetPass_token;
  if (!resetToken ){
    return res.status(401).json({ message: "Không có token, không thể thực hiện hành động." });
  }

  try{
    const payload = jwt.verify(resetToken, process.env.JWT_SECRET);
    req.resetPayload = payload;
    next();
  }
  catch{
    return res.status(403).json({ message: "Token không hợp lệ" });
  }
}

module.exports =  { authMiddleware, checkPassTokenMiddleware };