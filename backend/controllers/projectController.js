import Project from "../models/Project.js";

// Створити проєкт
export const createProject = async (req, res, next) => {
  try {
    const { title, description, dateStart, dateEnd, location } = req.body;

    if (dateEnd && new Date(dateEnd) < new Date(dateStart)) {
      return res
        .status(400)
        .json({ message: "'dateEnd' cannot be earlier than 'dateStart'" });
    }
    // Додаємо підтримку фото
    const image = req.file ? req.file.filename : null;

    const newProject = new Project({
      title,
      description,
      dateStart,
      dateEnd,
      location,
      organizer: req.user.id,
      image,
    });

    await newProject.save();
    res.status(201).json(newProject);
  } catch (err) {
    next(err); // Виклик централізованого errorHandler
  }
};

// Отримати всі проєкти
export const getProjects = async (req, res) => {
  try {
    const projects = await Project.find()
      .populate("organizer", "name email")
      .populate("participants", "name email");
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

    const { title, description, dateStart, dateEnd, location } = req.body;

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

    // Додаємо оновлення фото, якщо файл є
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

    // Перевірка власника або admin
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

    // Атомарно додаємо користувача, якщо його ще нема
    const project = await Project.findByIdAndUpdate(
      projectId,
      { $addToSet: { participants: userId } }, // додає, тільки якщо нема
      { new: true }
    );

    if (!project) return res.status(404).json({ message: "Project not found" });

    // Перевірка, чи користувач уже був учасником — якщо ні, то додали, якщо так — то повертаємо повідомлення
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

    // Атомарно видаляємо користувача з масиву учасників
    const project = await Project.findByIdAndUpdate(
      projectId,
      { $pull: { participants: userId } }, // видаляє всі входження userId
      { new: true }
    );

    if (!project) return res.status(404).json({ message: "Project not found" });

    // Перевірка, чи користувач взагалі був учасником (після видалення)
    const isParticipant = project.participants.some(
      (p) => p.toString() === userId
    );
    if (isParticipant) {
      // Якщо він досі в списку — щось не так
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
