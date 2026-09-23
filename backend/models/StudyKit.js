const mongoose = require("mongoose");

const studyKitSchema = new mongoose.Schema(
  {
    userEmail: {
      type: String,
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    studyKit: {
      type: Object,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("StudyKit", studyKitSchema);