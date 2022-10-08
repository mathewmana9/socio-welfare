const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.token;
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) return res.status(403).json({ messsage: "Invalid token!" });
      req.user = user;
      next();
    });
  } else {
    return res.status(401).json({ messsage: "You are not authenticated" });
  }
};

const verifyAndAuthourize = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.id === req.params.id || req.user.isAdmin) {
      next();
    } else {
      res
        .status(403)
        .json({ messsage: "You are not authorized to access this route" });
    }
  });
};
const verifyAndAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.isAdmin) {
      next();
    } else {
      res
        .status(403)
        .json({ messsage: "You are not authorized to access this route" });
    }
  });
};

module.exports = { verifyToken, verifyAndAuthourize, verifyAndAdmin };
