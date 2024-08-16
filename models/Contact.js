const mongoose = require("mongoose", { useUnifiedTopology: true });

const contactSchema = new mongoose.Schema({
  name: String,
  email: String,
  subject: String,
  message: String,
});

const Contact = new mongoose.model("Contact", contactSchema);

module.exports = Contact;
