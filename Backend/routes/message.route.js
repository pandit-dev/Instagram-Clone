import express from "express";
import isLoggedIn from "../middlewares/isLoggedIn.js";
import upload from "../middlewares/multer.js";
import { getMessage, sendMessage } from "../controllers/message.controller.js";

const router = express.Router();

router.route("/send/:id").post(isLoggedIn, sendMessage);
router.route("/all/:id").get(isLoggedIn, getMessage);

export default router;
