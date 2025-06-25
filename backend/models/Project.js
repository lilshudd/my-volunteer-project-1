import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  dateStart: { type: Date, required: true },
  dateEnd: { type: Date },
  location: { type: String },
  organizer: {
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
  createdAt: { type: Date, default: Date.now },
  donationLink: { type: String },
  urgent: { type: Boolean, default: false },
  locationCoords: {
    type: [Number], // [latitude, longitude]
    default: undefined,
  },
});

export default mongoose.model("Project", projectSchema);
