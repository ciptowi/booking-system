const { User } = require("../db/models");
const { sendResponse } = require("../utils/sendResponse");

module.exports = {
  checkUser: async (req, res, next) => {
    const { username, email } = req.body;
    const alreadyUsername = await User.findOne({ where: { username } });
    const alreadyEmail = await User.findOne({ where: { email } });

    if (alreadyUsername) {
      sendResponse(res, 400, false, "Failed! username is already", null, null);
    } else if (alreadyEmail) {
      sendResponse(res, 400, false, "Failed! email is already", null, null);
    } else {
      next();
    }
  },
};
