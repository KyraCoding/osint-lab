const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const user_schema = new Schema({
    username: { type: String, required: true },
    solves: [{ type: Schema.Types.ObjectId, ref: 'Challenge' }],
}, { timestamps: true });


// Define the Challenge model
const User = mongoose.model('User', user_schema);

module.exports = User;