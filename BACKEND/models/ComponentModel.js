const mongoose = require("mongoose");

const ComponentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: false },
    code: { type: String, required: true },
    name: { type: String }, // optional: helpful if you want to label/search saved components
  },
  { timestamps: true }
);

module.exports = mongoose.model("Component", ComponentSchema);