const { Schema, model } = require("mongoose");

const Document = new Schema({
  _id: String,
  data: Object,
  html: String,
  history: [
    {
      data: Object,
      html: String,
      timestamp: Number,
    },
  ],
});

module.exports = model("Document", Document);
