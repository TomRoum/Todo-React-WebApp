import { findUserByEmail, createUser } from "../models/User.js";
import { ApiError } from "../helper/ApiError.js";
import { hash, compare } from "bcrypt";
import jwt from "jsonwebtoken";

const { sign } = jwt;

const signup = async (req, res, next) => {
  const { user } = req.body;

  try {
    if (!user || !user.email || !user.password) {
      return next(new ApiError("Email and password are required", 400));
    }

    // Check if user already exists
    const existingUser = await findUserByEmail(user.email);
    if (existingUser.rows.length > 0) {
      return next(new ApiError("Email already exists", 409));
    }

    // Hash password and create user
    const hashedPassword = await hash(user.password, 10);
    const result = await createUser(user.email, hashedPassword);

    return res.status(201).json({
      id: result.rows[0].id,
      email: result.rows[0].email
    });
  } catch (error) {
    return next(error);
  }
};

const signin = async (req, res, next) => {
  const { user } = req.body;

  try {
    if (!user || !user.email || !user.password) {
      return next(new ApiError("Email and password are required", 400));
    }

    // Find user
    const result = await findUserByEmail(user.email);
    if (result.rows.length === 0) {
      return next(new ApiError("User not found", 404));
    }

    const dbUser = result.rows[0];

    // Compare password
    const isMatch = await compare(user.password, dbUser.password);
    if (!isMatch) {
      return next(new ApiError("Invalid password", 401));
    }

    // Generate token
    const token = sign(
      { user: dbUser.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    return res.status(200).json({
      id: dbUser.id,
      email: dbUser.email,
      token
    });
  } catch (error) {
    return next(error);
  }
};

const login = async (req, res, next) => {
  const { user } = req.body;

  try {
    if (!user || !user.email || !user.password) {
      return next(new ApiError("Email and password are required", 400));
    }

    // Find user
    const result = await findUserByEmail(user.email);
    if (result.rows.length === 0) {
      return next(new ApiError("Invalid email or password", 401));
    }

    const foundUser = result.rows[0];

    // Compare password
    const match = await compare(user.password, foundUser.password);
    if (!match) {
      return next(new ApiError("Invalid email or password", 401));
    }

    // Generate token
    const token = sign(
      { id: foundUser.id, email: foundUser.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    return res.status(200).json({
      id: foundUser.id,
      email: foundUser.email,
      token: token
    });
  } catch (error) {
    return next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    // In a stateless JWT system, logout is handled client-side
    // Server just confirms the request
    return res.status(200).json({
      message: "Logged out successfully"
    });
  } catch (error) {
    return next(error);
  }
};

export { signup, signin, login, logout };