const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload");
const {
  profilefriend,
  getAll,
  register,
  login,
  profileupdate,
  profile,
  refreshToken,
  updatePhoto,
} = require("../controller/users");
const { protect } = require("../middlewares/auth");

router
  .get("/", protect, getAll)
  .get("/profile/friend/:id", protect, profilefriend)
  .post("/register", register)
  .post("/login", login)
  .post("/refresh-token", refreshToken)
  .put("/profile", protect, profileupdate)
  .put("/profile/image", protect, upload.single("photo"), updatePhoto)
  .get("/profile", protect, profile);

module.exports = router;
