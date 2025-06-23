import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Project from "../models/Project.js";

// Додаємо cookie-parser для роботи з cookie
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";
const JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || "superrefreshsecret";

const allowedRoles = ["user", "organizer", "admin"];

// Генерація токенів
function generateTokens(user) {
  const accessToken = jwt.sign(
    { id: user._id, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: "15m" }
  );
  const refreshToken = jwt.sign(
    { id: user._id, role: user.role, name: user.name },
    JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );
  return { accessToken, refreshToken };
}

// Реєстрація користувача
export const register = async (req, res) => {
  try {
    const { name, email, password, role, organizerRequest } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name, email and password are required" });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser)
      return res.status(400).json({ message: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const assignedRole = allowedRoles.includes(role) ? role : "user";

    const newUser = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: assignedRole,
      organizerRequest: !!organizerRequest, // Зберігаємо заявку
    });

    // Генеруємо токени одразу після реєстрації
    const { accessToken, refreshToken } = generateTokens(newUser);

    // Відправляємо refresh токен у httpOnly cookie
    res
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 днів
      })
      .status(201)
      .json({
        message: "User registered successfully",
        accessToken,
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          organizerRequest: newUser.organizerRequest,
        },
      });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Логін користувача
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user)
      return res.status(401).json({ message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid email or password" });

    // Створюємо токени
    const { accessToken, refreshToken } = generateTokens(user);

    // Відправляємо refresh токен у httpOnly cookie
    res
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 днів
      })
      .status(200)
      .json({
        message: "Login successful",
        accessToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          organizerRequest: user.organizerRequest,
        },
      });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Логаут користувача
export const logout = async (req, res) => {
  res
    .clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    })
    .status(200)
    .json({ message: "Logout successful" });
};

// Оновлення access токена через refresh токен (з cookie)
export const refresh = async (req, res) => {
  try {
    const refreshToken =
      req.cookies?.refreshToken ||
      req.body?.refreshToken ||
      req.headers["x-refresh-token"];
    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token required" });
    }

    jwt.verify(refreshToken, JWT_REFRESH_SECRET, async (err, decoded) => {
      if (err)
        return res.status(403).json({ message: "Invalid refresh token" });

      const user = await User.findById(decoded.id);
      if (!user) return res.status(404).json({ message: "User not found" });

      const accessToken = jwt.sign(
        { id: user._id, role: user.role, name: user.name },
        JWT_SECRET,
        { expiresIn: "15m" }
      );

      res.status(200).json({ accessToken });
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ОНОВЛЕНИЙ метод отримання профілю користувача
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    // Знаходимо всі проєкти, де користувач є учасником
    const projects = await Project.find({ participants: user._id }).select(
      "_id name title"
    );

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      projects, // <-- повертаємо масив проєктів
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Оновлення профілю користувача
export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const { name, email, password } = req.body;

    if (name) user.name = name;
    if (email) user.email = email;
    if (password) user.password = await bcrypt.hash(password, 10);

    await user.save();

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      organizerRequest: user.organizerRequest,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Отримати всіх користувачів із заявкою на організатора (тільки для admin)
export const getOrganizerRequests = async (req, res) => {
  try {
    if (req.user.role !== "admin")
      return res.status(403).json({ message: "Access denied" });
    const users = await User.find({ organizerRequest: true }).select(
      "-password"
    );
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Підтвердити заявку (змінити роль, тільки для admin)
export const approveOrganizer = async (req, res) => {
  try {
    if (req.user.role !== "admin")
      return res.status(403).json({ message: "Access denied" });
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    user.role = "organizer";
    user.organizerRequest = false;
    await user.save();
    res.json({ message: "Роль організатора підтверджено", user });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Отримати всіх користувачів (тільки для admin)
export const getAllUsers = async (req, res) => {
  try {
    if (req.user.role !== "admin")
      return res.status(403).json({ message: "Access denied" });
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Змінити роль користувача (тільки для admin)
export const updateUserRole = async (req, res) => {
  try {
    if (req.user.role !== "admin")
      return res.status(403).json({ message: "Access denied" });

    const { id } = req.params;
    const { role } = req.body;
    const allowedRoles = ["user", "organizer", "admin"];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const user = await User.findById(req.user.id).populate(
      "projects",
      "name title"
    );
    res.json({
      name: user.name,
      email: user.email,
      role: user.role,
      projects: user.projects, // <-- це важливо!
    });
    if (!user) return res.status(404).json({ message: "User not found" });

    user.role = role;
    await user.save();

    res.json({ message: "Role updated", user });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
