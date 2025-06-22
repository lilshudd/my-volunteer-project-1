import Project from "../models/Project.js";

// Створити проєкт
export const createProject = async (req, res, next) => {
  try {
    const {
      title,
      description,
      dateStart,
      dateEnd,
      location,
      donationLink,
      urgent,
      locationCoords,
    } = req.body;

    if (dateEnd && new Date(dateEnd) < new Date(dateStart)) {
      return res
        .status(400)
        .json({ message: "'dateEnd' cannot be earlier than 'dateStart'" });
    }
    const image = req.file ? req.file.filename : null;

    const newProject = new Project({
      title,
      description,
      dateStart,
      dateEnd,
      location,
      donationLink,
      urgent: urgent === "true" || urgent === true,
      locationCoords: locationCoords ? JSON.parse(locationCoords) : undefined,
      organizer: req.user.id,
      image,
    });

    await newProject.save();
    res.status(201).json(newProject);
  } catch (err) {
    next(err);
  }
};

// Отримати всі проєкти (з фільтрацією по urgent і limit)
export const getProjects = async (req, res) => {
  try {
    const query = {};
    if (req.query.urgent === "true") query.urgent = true;
    const limit = Number(req.query.limit) || 0;
    const projectsQuery = Project.find(query)
      .populate("organizer", "name email")
      .populate("participants", "name email")
      .sort({ urgent: -1, dateStart: -1 });
    if (limit) projectsQuery.limit(limit);
    const projects = await projectsQuery;
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Отримати конкретний проєкт по id
export const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("organizer", "name email")
      .populate("participants", "name email");

    if (!project) return res.status(404).json({ message: "Project not found" });

    res.json(project);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Оновити проєкт (тільки організатор)
export const updateProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    if (
      project.organizer.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    const {
      title,
      description,
      dateStart,
      dateEnd,
      location,
      donationLink,
      urgent,
      locationCoords,
    } = req.body;

    if (dateEnd && dateStart && new Date(dateEnd) < new Date(dateStart)) {
      return res
        .status(400)
        .json({ message: "'dateEnd' cannot be earlier than 'dateStart'" });
    }

    project.title = title || project.title;
    project.description = description || project.description;
    project.dateStart = dateStart || project.dateStart;
    project.dateEnd = dateEnd || project.dateEnd;
    project.location = location || project.location;
    if (donationLink !== undefined) project.donationLink = donationLink;
    if (urgent !== undefined)
      project.urgent = urgent === "true" || urgent === true;
    if (locationCoords !== undefined)
      project.locationCoords = JSON.parse(locationCoords);

    if (req.file) {
      project.image = req.file.filename;
    }

    await project.save();
    res.json(project);
  } catch (err) {
    next(err);
  }
};

// Видалити проєкт (тільки організатор)
export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    if (
      project.organizer.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    await project.deleteOne();
    res.json({ message: "Project deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Додати користувача до учасників проекту
export const participateInProject = async (req, res) => {
  try {
    const projectId = req.params.id;
    const userId = req.user.id;

    const project = await Project.findByIdAndUpdate(
      projectId,
      { $addToSet: { participants: userId } },
      { new: true }
    );

    if (!project) return res.status(404).json({ message: "Project not found" });

    const isParticipant = project.participants.some(
      (p) => p.toString() === userId
    );
    if (!isParticipant) {
      return res.status(400).json({ message: "You are already a participant" });
    }

    res.status(200).json({ message: "Successfully joined the project" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Видалити користувача з учасників проекту
export const leaveProject = async (req, res) => {
  try {
    const projectId = req.params.id;
    const userId = req.user.id;

    const project = await Project.findByIdAndUpdate(
      projectId,
      { $pull: { participants: userId } },
      { new: true }
    );

    if (!project) return res.status(404).json({ message: "Project not found" });

    const isParticipant = project.participants.some(
      (p) => p.toString() === userId
    );
    if (isParticipant) {
      return res.status(400).json({ message: "You are not a participant" });
    }

    res.status(200).json({ message: "Successfully left the project" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Отримати всі проєкти, у яких користувач є учасником
export const getMyProjects = async (req, res) => {
  try {
    const projects = await Project.find({ participants: req.user.id })
      .populate("organizer", "name email")
      .populate("participants", "name email");
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
