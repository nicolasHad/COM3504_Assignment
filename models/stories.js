const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const story = new Schema({

        title: {
            type: String,
            required: true,
            max: 100
        },
        author: {
            type: String,
            required: true,
            max: 100
        },
        description: {
            type: String,
            required: true
        }
    });

module.exports = mongoose.model('Story', story);
