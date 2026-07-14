const mongoose = require('mongoose');
const uniqueValidatorPkg = require('mongoose-unique-validator');
const uniqueValidator = uniqueValidatorPkg.default || uniqueValidatorPkg;

const userSchema = mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);