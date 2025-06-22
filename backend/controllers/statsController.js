import Project from "../models/Project.js";
import User from "../models/User.js";

export const getStats = async (req, res) => {
  try {
    const projects = await Project.countDocuments();
    const volunteers = await User.countDocuments({
      role: { $in: ["user", "organizer"] },
    });
    // Якщо потрібно рахувати всіх, крім admin:
    // const volunteers = await User.countDocuments({ role: { $ne: "admin" } });

    // Якщо у вас є поле donations або інша логіка для підрахунку донатів — додайте тут:
    // const donations = await Project.aggregate([{ $group: { _id: null, total: { $sum: "$donatedAmount" } } }]);
    // const donationsSum = donations[0]?.total || 0;

    res.json({
      projects,
      volunteers,
      donations: 0, // Поки що 0, якщо додасте поле — змініть тут
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
