import { selectAllTasks, insertTask, deleteTask } from "../models/Task.js";
import { ApiError } from "../helper/ApiError.js";

const getTasks = async (req, res, next) => {
  try {
    const result = await selectAllTasks();
    return res.status(200).json(result.rows || []);
  } catch (error) {
    return next(error);
  }
};

const postTask = async (req, res, next) => {
  const { task } = req.body;
  console.log("Task to create:", task);
  try {
    if (!task || !task.description || task.description.trim().length === 0) {
      return next(new ApiError("Task description is required", 400));
    }
    const result = await insertTask(task.description);
    return res
      .status(201)
      .json({ id: result.rows[0].id, description: result.rows[0].description });
  } catch (error) {
    return next(error);
  }
};

const removeTask = async (req, res, next) => {
  const id = parseInt(req.params.id);
  try {
    if (isNaN(id)) {
      return next(new ApiError("Invalid task ID", 400));
    }
    const result = await deleteTask(id);
    if (result.rows.length === 0) {
      return next(new ApiError("Task not found", 404));
    }
    return res.status(200).json({ id: result.rows[0].id });
  } catch (error) {
    return next(error);
  }
};

export { getTasks, postTask, removeTask };