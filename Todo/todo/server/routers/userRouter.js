import { Router } from "express";
import { signup, signin, login, logout } from "../controllers/UserController.js";
import { auth } from "../helper/auth.js";

const router = Router();

router.post("/signup", signup);
router.post("/signin", signin);
router.post("/login", login);
router.post("/logout", auth, logout);

export default router;