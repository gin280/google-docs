const { Schema, model } = require("mongoose");

const Template = new Schema({
  _id: String,
  name: String,
  timestamp: Number,
  data: Object
});

module.exports = model("Template", Template);