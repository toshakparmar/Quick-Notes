const mongoose = require("mongoose");

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const isNumeric = (value) => !isNaN(parseFloat(value)) && isFinite(value);

const validateAndParseId = (id) => {
  if (isNumeric(id)) {
    return { noteId: parseInt(id) };
  }
  if (isValidObjectId(id)) {
    return { _id: id };
  }
  throw new Error("Invalid ID format");
};

module.exports = {
  isValidObjectId,
  isNumeric,
  validateAndParseId,
};
