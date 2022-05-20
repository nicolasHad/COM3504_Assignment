//Constant declarations
const mongoose = require('mongoose');

const Schema = mongoose.Schema;
/**
 * Defines schema of stories following mongoose structure
 * @type {module:mongoose.Schema<any, Model<any, any, any, any>, {}, {}>}
 */
const story = new Schema({

    author: {
        type: String,
        required: true,
        max: 15
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    imageUrl: {
        type: String,
        required: true
    },
    date: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Story', story);
