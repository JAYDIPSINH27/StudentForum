const mongoose = require("mongoose", { useUnifiedTopology: true });

const questionSchema = new mongoose.Schema({
  questionAsker: String,
  question: String,
  answers: [{type: mongoose.Schema.Types.ObjectId, ref: 'Answer'}]
});

const Question = new mongoose.model("Question", questionSchema);

module.exports = Question;
