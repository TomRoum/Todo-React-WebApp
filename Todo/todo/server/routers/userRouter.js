import { pool } from "../helper/db.js";
import { Router } from "express";
import { hash, compare } from "bcrypt";
import jwt from "jsonwebtoken";

const { sign } = jwt;
const router = Router();

router.post("/signup", (req, res, next) => {
  const { user } = req.body;
  
  if (!user || !user.email || !user.password) {
    const error = new Error("Email and password are required");
    error.status = 400;
    return next(error);
  }

  hash(user.password, 10, (err, hashedPassword) => {
    if (err) {
      console.error("Error hashing password:", err);
      return next(err);
    }

    pool.query(
      "INSERT INTO account (email, password) VALUES ($1, $2) RETURNING id, email",
      [user.email, hashedPassword],
      (err, result) => {
        if (err) {
          console.error("Error creating user:", err);
          
          if (err.code === '23505') {
            const error = new Error("Email already exists");
            error.status = 409;
            return next(error);
          }
          return next(err);
        }
        res.status(201).json({ 
          id: result.rows[0].id, 
          email: result.rows[0].email 
        });
      }
    );
  });
});

router.post("/login", (req, res, next) => {
  const { user } = req.body;

  if (!user || !user.email || !user.password) {
    const error = new Error("Email and password are required");
    error.status = 400;
    return next(error);
  }

  pool.query(
    "SELECT * FROM account WHERE email = $1",
    [user.email],
    (err, result) => {
      if (err) {
        console.error("Error finding user:", err);
        return next(err);
      }

      if (result.rows.length === 0) {
        const error = new Error("Invalid email or password");
        error.status = 401;
        return next(error);
      }

      const foundUser = result.rows[0];

      compare(user.password, foundUser.password, (err, match) => {
        if (err) {
          console.error("Error comparing passwords:", err);
          return next(err);
        }

        if (!match) {
          const error = new Error("Invalid email or password");
          error.status = 401;
          return next(error);
        }

        const token = sign(
          { id: foundUser.id, email: foundUser.email },
          process.env.JWT_SECRET,
          { expiresIn: '1h' }
        );

        res.status(200).json({
          id: foundUser.id,
          email: foundUser.email,
          token: token
        });
      });
    }
  );
});

export default router;