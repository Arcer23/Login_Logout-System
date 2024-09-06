// yo kura haru maile ali ali bujhya xaina aaile
const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  date: {
    type: Date,
    default: Date.now,
  },
  content: String,
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "user", default: [] }],
});

module.exports = mongoose.model("post", PostSchema);
