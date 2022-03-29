const mongoose = require('mongoose');

const Schema = mongoose.Schema;

// Defines the object schema for the database
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
            type: String
        }
    });

module.exports = mongoose.model('Story', story);
