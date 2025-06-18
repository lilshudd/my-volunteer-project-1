import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

export const authMiddleware = (req, res, next) => {
  try {
    // Беремо токен з заголовку Authorization: Bearer <token>
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: "No authorization header" });
    }

    if (!authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "Invalid authorization header format" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    // Перевіряємо токен
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // додаємо дані користувача до req

    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
