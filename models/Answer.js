const mongoose = require("mongoose", { useUnifiedTopology: true });

const answerSchema = new mongoose.Schema({
  owner: String,
  answer: String,
  link: String,
  like: [String],
  dislike: [String]
});

const Answer = new mongoose.model("Answer", answerSchema);

module.exports = Answer;
