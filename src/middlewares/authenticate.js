const { sendResponse } = require("../utils/sendResponse");
const config = require("../config/auth");
const jwt = require("jsonwebtoken");

module.exports = {
  verifyToken: (req, res, next) => {
    let token = req.headers["x-access-token"];
    if (!token) {
      sendResponse(res, 403, false, "No token provided!", null, null);
    }
    jwt.verify(token, config.secret, (err, decoded) => {
      if (err) {
        sendResponse(res, 401, false, "Unauthorized!", null, null);
      }
      req.id = decoded.id;
      next();
    });
  },
};
