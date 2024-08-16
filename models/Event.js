const mongoose = require("mongoose", { useUnifiedTopology: true });



const eventSchema = new mongoose.Schema({
  title: String,
  content: String,
  link: String,
  youtubeLink: String

});

const Event = new mongoose.model("Event", eventSchema);

module.exports = Event;
