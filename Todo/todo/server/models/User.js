import { pool } from "../helper/db.js";

const findUserByEmail = async (email) => {
  return await pool.query(
    "SELECT * FROM account WHERE email = $1",
    [email]
  );
};

const createUser = async (email, hashedPassword) => {
  return await pool.query(
    "INSERT INTO account (email, password) VALUES ($1, $2) RETURNING id, email",
    [email, hashedPassword]
  );
};

export { findUserByEmail, createUser };