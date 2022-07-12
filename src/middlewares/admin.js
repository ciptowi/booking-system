const { User } = require("../db/models");
const config = require("../config/auth");
const jwt = require("jsonwebtoken");
const { sendResponse } = require("../utils/sendResponse");

module.exports = {
  isAdmin: async (req, res, next) => {
    const token = req.headers["x-access-token"];
    const id = jwt.verify(token, config.secret, (err, decoded) => {
      if (err) {
        console.log(err.message);
      }
      return decoded.id;
    });
    const user = await User.findOne({ where: { id } });

    if (!user) {
      sendResponse(res, 404, false, "Failed! user not found", null, null);
    } else if (user.role != "admin") {
      sendResponse(
        res,
        403,
        false,
        "Failed! you don't have permission",
        null,
        null
      );
    } else if (user.role == "admin") {
      next();
    }
  },
};
