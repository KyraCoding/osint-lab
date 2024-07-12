const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const user_schema = new Schema({
    username: { type: String, required: true },
    solves: [{ type: Schema.Types.ObjectId, ref: 'challenge' }],
}, { timestamps: true });


// Define the Challenge model
const user = mongoose.model('user', user_schema);

module.exports = user;