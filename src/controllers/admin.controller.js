const { User, Room, Book, sequelize } = require("../db/models");
const { sendResponse } = require("../utils/sendResponse");
const config = require("../config/auth");
const jwt = require("jsonwebtoken");

findAllUser = (req, res) => {
  User.findAll()
    .then((data) => {
      if (!data) {
        sendResponse(res, 404, true, "Not found", null, null);
      } else if (data) {
        sendResponse(res, 200, true, "All Account", data, null);
      }
    })
    .catch((error) => {
      sendResponse(res, 500, false, null, null, error.message);
    });
};
adminGetRoom = (req, res) => {
  // { include: [{ model: User }, { model: Book }] }
  try {
    Room.findAll({ include: { model: Book } })
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
adminGetRoomById = (req, res) => {
  const room_id = req.params.id;
  try {
    Room.findOne({ where: { id: room_id }, include: { model: Book } })
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
createRoom = (req, res) => {
  const room = {
    room_name: req.body.room_name,
    booked: false,
    BookId: null,
  };
  try {
    Room.create(room);
    sendResponse(res, 201, true, "Room was created successfully!", null, null);
  } catch (error) {
    sendResponse(res, 500, false, null, null, error.message);
  }
};
deleteRoom = (req, res) => {
  const id = req.params.id;
  Room.findOne({ where: { id } })
    .then((data) => {
      if (!data) {
        sendResponse(res, 404, true, "Not found", null, null);
      }
      Room.destroy({ where: { id } });
      sendResponse(res, 201, true, "Room was Deleted!", null, null);
    })
    .catch(() => {
      sendResponse(res, 500, true, null, null, error.message);
    });
};
deleteBook = async (req, res) => {
  const trans = await sequelize.transaction();
  const book_id = req.params.id;
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
      await User.findOne({ where: { BookId: book_id } }, { transaction: trans })
        .then((data) => {
          if (data) {
            User.update({ BookId: null }, { where: { BookId: book_id } });
          }
        })
        .catch((e) => console.log(e.message));
      await Room.findOne({ where: { BookId: book_id } }, { transaction: trans })
        .then((data) => {
          Room.update(
            { booked: false, BookId: null },
            { where: { BookId: book_id } }
          );
        })
        .catch((e) => console.log(e.message));
      await Book.destroy({ where: { id: book_id } }, { transaction: trans });
      await trans.commit();
      sendResponse(res, 201, true, "Book was Deleted!", null, null);
    } catch (error) {
      await trans.rollback();
      sendResponse(res, 500, false, null, null, error.message);
    }
  }
};

const admin = {
  findAllUser,
  adminGetRoom,
  adminGetRoomById,
  createRoom,
  deleteRoom,
  deleteBook,
};
module.exports = admin;
