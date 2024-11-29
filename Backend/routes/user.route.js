import express from "express";
import { editProfile, followOrUnfollow, getProfile, getSuggestedUsers, login, logout, signup,} from "../controllers/user.controller.js";
import isLoggedIn from "../middlewares/isLoggedIn.js";
import upload from "../middlewares/multer.js";

const router = express.Router();

router.route("/signup").post(signup);
router.route("/login").post(login);
router.route("/logout").get(logout);
router.route("/:id/profile").get(isLoggedIn, getProfile);
router.route("/profile/edit").post(isLoggedIn, upload.single("profilePhoto"), editProfile);
router.route("/suggested").get(isLoggedIn, getSuggestedUsers);
router.route("/followorunfollow/:id").post(isLoggedIn, followOrUnfollow);

export default router;
