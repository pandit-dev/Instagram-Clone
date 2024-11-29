import express from "express";
import isLoggedIn from "../middlewares/isLoggedIn.js";
import upload from "../middlewares/multer.js";
import { addComment, addNewPost, bookmarkedPost, deletePost, getAllPosts, getCommentsOfPost, getPostsOfUser, likePost, unLikePost } from "../controllers/post.controller.js";

const router = express.Router();

router.route("/addpost").post(isLoggedIn, upload.single('image'), addNewPost);
router.route("/all").get(isLoggedIn, getAllPosts);
router.route("/userpost/all").get(isLoggedIn, getPostsOfUser);
router.route("/:id/like").get(isLoggedIn, likePost);
router.route("/:id/unlike").get(isLoggedIn, unLikePost);
router.route("/:id/comment").post(isLoggedIn, addComment);
router.route("/:id/comment/all").get(isLoggedIn, getCommentsOfPost);
router.route("/delete/:id").delete(isLoggedIn, deletePost);
router.route("/:id/bookmark").get(isLoggedIn, bookmarkedPost);

export default router;
