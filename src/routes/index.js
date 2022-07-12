const router = require("express").Router();
const { admin, auth, user } = require("../controllers");
const { checkUser } = require("../middlewares/verify");
const { verifyToken } = require("../middlewares/authenticate");
const { isAdmin } = require("../middlewares/admin");

// Authentication
router.post("/auth/signup", checkUser, auth.signUp);
router.post("/auth/signin", auth.signIn);
router.put("/auth/update", verifyToken, auth.updateUser);
router.delete("/auth/delete", verifyToken, auth.deleteUser);

// Users
router.get("/", user.index);
router.get("/user/room", verifyToken, user.userGetRoom);
router.post("/user/book", verifyToken, user.createBook);
router.get("/user/book", verifyToken, user.findMyBooked);
router.put("/user/book", verifyToken, user.updateBook);

// Admin
router.get("/admin/users", [verifyToken, isAdmin], admin.findAllUser);
router.get("/admin/room", [verifyToken, isAdmin], admin.adminGetRoom);
router.get("/admin/room/:id", [verifyToken, isAdmin], admin.adminGetRoomById);
router.post("/admin/room", [verifyToken, isAdmin], admin.createRoom);
router.delete("/admin/room/:id", [verifyToken, isAdmin], admin.deleteRoom);
router.delete("/admin/book/:id", [verifyToken, isAdmin], admin.deleteBook);
router.delete("/admin/user/:id", [verifyToken, isAdmin], auth.deleteUserById);

module.exports = router;
