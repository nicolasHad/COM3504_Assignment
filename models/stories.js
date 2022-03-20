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
        picture: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        }
    });

