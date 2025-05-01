const mongoose = require("mongoose");
const Counter = require("./counter.model");

const noteSchema = new mongoose.Schema({
  noteId: { type: Number, unique: true },
  note: String,
  date: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: Boolean,
    default: false,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

noteSchema.pre("save", async function (next) {
  if (!this.noteId) {
    const counter = await Counter.findByIdAndUpdate(
      "noteId",
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    this.noteId = counter.seq;
  }
  next();
});

module.exports = mongoose.model("Note", noteSchema);
