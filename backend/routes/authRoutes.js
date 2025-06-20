import { body, validationResult } from "express-validator";
import express from "express";
import {
  register,
  login,
  logout,
  refresh,
  getProfile,
  updateProfile,
  getOrganizerRequests,
  approveOrganizer,
  getAllUsers,
  updateUserRole,
} from "../controllers/authController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post(
  "/register",
  [
    body("name")
      .isLength({ min: 2 })
      .withMessage("Name must be at least 2 chars"),
    body("email").isEmail().withMessage("Invalid email"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 chars"),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  register
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Invalid email"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  login
);

// Додаємо logout
router.post("/logout", logout);

// Додаємо refresh токена
router.post("/refresh", refresh);

router.get("/me", authMiddleware, getProfile);

router.put(
  "/me",
  authMiddleware,
  [
    body("name")
      .optional()
      .isLength({ min: 2 })
      .withMessage("Name must be at least 2 chars"),
    body("email").optional().isEmail().withMessage("Invalid email"),
    body("password")
      .optional()
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 chars"),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  updateProfile
);

router.get("/organizer-requests", authMiddleware, getOrganizerRequests);

router.post("/approve-organizer/:id", authMiddleware, approveOrganizer);

router.get("/users", authMiddleware, getAllUsers);

// Роут для зміни ролі користувача (тільки для admin)
router.patch("/users/:id/role", authMiddleware, updateUserRole);

export default router;
