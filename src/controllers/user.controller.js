const { User, Room, Book, sequelize } = require("../db/models");
const { sendResponse } = require("../utils/sendResponse");
const config = require("../config/auth");
const jwt = require("jsonwebtoken");

index = (req, res) => {
  sendResponse(res, 200, true, "Welcome, server is running", null, null);
};
userGetRoom = (req, res) => {
  try {
    Room.findAll()
      .then((data) => {
        sendResponse(res, 200, true, null, data, null);
      })
      .catch((error) => {
        sendResponse(res, 404, true, "Not found", null, error.message);
      });
  } catch (error) {
    sendResponse(res, 500, false, null, null, error.message);
  }
};
createBook = async (req, res) => {
  const trans = await sequelize.transaction();
  const token = req.headers["x-access-token"];
  const decoded = jwt.verify(token, config.secret, (err, decoded) => {
    if (err) {
      console.log(err.message);
    }
    return decoded;
  });
  const Room_id = parseInt(req.body.RoomId);
  const User_id = parseInt(decoded.id);
  if (!decoded) {
    sendResponse(res, 401, false, "Unauthorized!", null, null);
  } else {
    try {
      const resBook = await Book.create(
        {
          booked_for: decoded.username,
          description: req.body.description,
          check_in: req.body.checkin_date,
          check_out: req.body.checkout_date,
        },
        { transaction: trans }
      );
      await Room.update(
        { booked: true, BookId: resBook.id },
        { where: { id: Room_id } },
        { transaction: trans }
      );
      await User.update(
        { BookId: resBook.id },
        { where: { id: User_id } },
        { transaction: trans }
      );
      await trans.commit();
      sendResponse(res, 201, true, "Booking successfully!", null, null);
    } catch (error) {
      await trans.rollback();
      sendResponse(res, 500, false, null, null, error.message);
    }
  }
};
findMyBooked = (req, res) => {
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
    try {
      User.findOne({ where: { id: id }, include: { model: Book } })
        .then((data) => {
          sendResponse(res, 200, true, null, data, null);
        })
        .catch((error) => {
          sendResponse(res, 404, true, "Not found", null, error.message);
        });
    } catch (error) {
      sendResponse(res, 500, false, null, null, error.message);
    }
  }
};
updateBook = async (req, res) => {
  const trans = await sequelize.transaction();
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
    try {
      const user = await User.findOne(
        { where: { id } },
        { transaction: trans }
      );
      await Book.update(
        req.body,
        { where: { id: user.BookId } },
        { transaction: trans }
      );
      await trans.commit();
      sendResponse(
        res,
        201,
        true,
        `Book with id: ${user.BookId} was Updated!`,
        null,
        null
      );
    } catch (error) {
      await trans.rollback();
      sendResponse(res, 500, false, null, null, error.message);
    }
  }
};

const user = {
  index,
  userGetRoom,
  createBook,
  findMyBooked,
  updateBook,
};
module.exports = user;
