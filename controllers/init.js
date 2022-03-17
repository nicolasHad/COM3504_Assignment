const mongoose = require('mongoose');
const Character = require('../models/characters');


exports.init= function() {
    // uncomment if you need to drop the database

    // Character.remove({}, function(err) {
    //    console.log('collection removed')
    // });

    const dob=new Date(1908, 12, 1).getFullYear();
    let character = new Character({
        first_name: 'Mickey',
        family_name: 'Mouse',
        dob: dob
    });
    // console.log('dob: '+character.dob);

    character.save()
        .then ((results) => {
            console.log("object created in init: "+ JSON.stringify(results));
        })
        .catch ((error) => {
            console.log(JSON.stringify(error));
        });
}

