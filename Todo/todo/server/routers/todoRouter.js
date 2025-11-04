import { pool } from "../helper/db.js";
import { Router } from "express";

const router = Router();

router.get("/", (req, res, next) => {
  pool.query("SELECT * FROM task", (err, result) => {
    if (err) {
      console.error("Error fetching tasks:", err);
      return next(err);
    }
    res.status(200).json(result.rows || []);
  });
});

router.post("/create", (req, res, next) => {
  const { task } = req.body;
  if (!task || !task.description) {
    return res.status(400).json({ error: "Task description is required" });
  }

  pool.query(
    "INSERT INTO task (description) VALUES ($1) RETURNING *",
    [task.description],
    (err, result) => {
      if (err) {
        console.error("Error creating task:", err);
        return next(err);
      }
      res.status(201).json(result.rows[0]);
    }
  );
});

router.delete("/delete/:id", (req, res, next) => {
  const id = parseInt(req.params.id);
  pool.query(
    "DELETE FROM task WHERE id = $1 RETURNING id",
    [id],
    (err, result) => {
      if (err) {
        console.error("Error deleting task:", err);
        return next(err);
      }
      res.status(200).json(result.rows[0]);
    }
  );
});

export default router;
