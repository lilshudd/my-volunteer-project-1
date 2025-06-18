import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true }, // Назва проєкту
  description: { type: String, required: true }, // Опис проєкту
  dateStart: { type: Date, required: true }, // Дата початку
  dateEnd: { type: Date }, // Дата закінчення
  organizer: {
    // Хто створив проєкт (користувач)
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  participants: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  image: { type: String },
  createdAt: { type: Date, default: Date.now }, // Дата створення
});

export default mongoose.model("Project", projectSchema);
