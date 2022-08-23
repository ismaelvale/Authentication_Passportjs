const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    profilePhoto: { type: String },
    fullName: { type: String },
    followers: { type: Array },
    following: { type: Array }
});

UserSchema.virtual('url').get(function () {
    return `/users/${this.id}`;
});

module.exports = mongoose.model('User', UserSchema);