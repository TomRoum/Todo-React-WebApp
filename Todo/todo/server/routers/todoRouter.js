import { Router } from "express";
import { auth } from "../helper/auth.js";
import { getTasks, postTask, removeTask } from "../controllers/TaskController.js";

const router = Router();

router.get("/", getTasks);
router.post("/create", auth, postTask);
router.delete("/delete/:id", removeTask);

export default router;