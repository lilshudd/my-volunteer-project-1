import Project from "../models/Project.js";
import User from "../models/User.js";

export const getStats = async (req, res) => {
  try {
    const projects = await Project.countDocuments();
    const volunteers = await User.countDocuments({
      role: { $in: ["user", "organizer"] },
    });

    res.json({
      projects,
      volunteers,
      donations: 0,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
