const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MessageSchema = new Schema({
    caption: { type: String, required: true },
    user: { type: String, required: true },
    added: { type: Date, default: Date.now },
    image: { type: String, required: true }
});

MessageSchema.virtual('url').get(function () {
    return `/messages/${this.id}`;
});

module.exports = mongoose.model('Messages', MessageSchema);