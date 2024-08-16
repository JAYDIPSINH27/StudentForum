const mongoose = require("mongoose", { useUnifiedTopology: true });

const announcementSchema = new mongoose.Schema({
  title: String,
  content: String,
  link: String,
  youtubeLink: String
});

const Announcement = new mongoose.model("Announcement", announcementSchema);

module.exports = Announcement;
