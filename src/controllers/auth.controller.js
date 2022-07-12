const { User } = require("../db/models");
const { sendResponse } = require("../utils/sendResponse");
const config = require("../config/auth");
const jwt = require("jsonwebtoken");

function format(user) {
  const { id, username } = user;
  return {
    id,
    username,
    accessToken: user.generateToken(),
  };
}

signUp = async (req, res) => {
  try {
    User.register(req.body);
    sendResponse(
      res,
      201,
      true,
      "Account was registered successfully!",
      null,
      null
    );
  } catch (error) {
    sendResponse(res, 500, false, null, null, error.message);
  }
};
signIn = (req, res) => {
  try {
    User.authenticate(req.body)
      .then((user) => {
        const token = format(user).accessToken;
        const data = {
          id: user.id,
          username: user.username,
          email: user.email,
          accessToken: token,
        };
        sendResponse(res, 201, true, "Sign in successfully!", data, null);
      })
      .catch((msg) => {
        sendResponse(res, 401, false, msg, null, null);
      });
  } catch (error) {
    sendResponse(res, 500, false, null, null, error.message);
  }
};
updateUser = (req, res) => {
  const token = req.headers["x-access-token"];
  const id = jwt.verify(token, config.secret, (err, decoded) => {
    if (err) {
      console.log(err.message);
    }
    return decoded.id;
  });
  if (!id) {
    sendResponse(res, 401, false, "Unauthorized!", null, null);
  } else {
    User.update(req.body, { where: { id } });
    sendResponse(res, 201, true, "Account was Updated!", null, null);
  }
};
deleteUser = (req, res) => {
  const token = req.headers["x-access-token"];
  const id = jwt.verify(token, config.secret, (err, decoded) => {
    if (err) {
      console.log(err.message);
    }
    return decoded.id;
  });
  if (!id) {
    sendResponse(res, 401, false, "Unauthorized!", null, null);
  } else {
    User.destroy({ where: { id } });
    sendResponse(res, 201, true, "Account was Deleted!", null, null);
  }
};
deleteUserById = (req, res) => {
  const token = req.headers["x-access-token"];
  const user_id = req.params.id;
  const id = jwt.verify(token, config.secret, (err, decoded) => {
    if (err) {
      console.log(err.message);
    }
    return decoded.id;
  });
  if (!id) {
    sendResponse(res, 401, false, "Unauthorized!", null, null);
  } else {
    User.findOne({ where: { id: user_id } }).then((user) => {
      if (user) {
        User.destroy({ where: { id: user_id } });
        sendResponse(
          res,
          201,
          true,
          `Account with id: ${user_id} was Deleted!`,
          null,
          null
        );
      }
    });
  }
};

const auth = {
  signUp,
  signIn,
  updateUser,
  deleteUser,
  deleteUserById,
};
module.exports = auth;
