const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const Character = new Schema(
    {
        test1: {type: String, required: true, max: 100},
        test2: {type: String, required: true, max: 100},
    }
);

// Virtual for a character's age
Character.virtual('age')
    .get(function () {
        const currentDate = new Date().getFullYear();
        return currentDate - this.dob;
    });

Character.set('toObject', {getters: true, virtuals: true});

module.exports = mongoose.model('Character', Character);
