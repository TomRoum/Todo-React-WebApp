import fs from "fs";
import path from "path";
import { pool } from "./db.js";
import { hash } from "bcrypt";
import jwt from "jsonwebtoken";

const __dirname = import.meta.dirname;

const initializeTestDb = () => {
  return new Promise((resolve, reject) => {
    const sql = fs.readFileSync(path.resolve(__dirname, "../db.sql"), "utf8");

    pool.query(sql, (err) => {
      if (err) {
        console.error("Error initializing test database:", err);
        reject(err);
      } else {
        console.log("Test database initialized successfully");
        resolve();
      }
    });
  });
};

const insertTestUser = (user) => {
  return new Promise((resolve, reject) => {
    hash(user.password, 10, (err, hashedPassword) => {
      if (err) {
        console.error("Error hashing password:", err);
        reject(err);
        return;
      }
      pool.query(
        "INSERT INTO account (email, password) VALUES ($1, $2) RETURNING id, email",
        [user.email, hashedPassword],
        (err, result) => {
          if (err) {
            console.error("Error inserting test user:", err);
            reject(err);
          } else {
            console.log("Test user inserted successfully");
            resolve(result.rows[0]);
          }
        }
      );
    });
  });
};

const getToken = (email) => {
  return jwt.sign({ email }, process.env.JWT_SECRET);
};

export { initializeTestDb, insertTestUser, getToken };