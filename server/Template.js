const { Schema, model } = require("mongoose");

const Template = new Schema({
  _id: String,
  data: Object
});

module.exports = model("Template", Template);