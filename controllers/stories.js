let Story = require('../models/stories');
/*
exports.getAge = function (req, res) {
    let userData = req.body;
    if (userData == null)
        res.status(403).json('No data sent!')

    Character.find({first_name: userData.firstname, family_name: userData.lastname},
        'first_name family_name dob age')
        .then(characters => {
            let character = null;
            if (characters.length > 0) {
                let firstElem = characters[0];
                character = {
                    name: firstElem.first_name, surname: firstElem.family_name,
                    dob: firstElem.dob, age: firstElem.age
                };
                res.json(character.age);
            } else {
                res.json("not found");
            }
        })
        .catch((err) => {
            res.status(500).send('Invalid data or not found!' + JSON.stringify(err));
        });
}


exports.insert = function (req, res) {
    let userData = req.body;
    if (userData == null) {
        res.status(403).send('No data sent!')
    }

    let character = new Character({
        first_name: userData.firstname,
        family_name: userData.lastname,
        dob: userData.year
    });
    console.log('received: ' + character);

    character.save()
        .then ((results) => {
            console.log(results._id);
            res.json(character);
        })
        .catch ((error) => {
            res.status(500).json('Could not insert - probably incorrect data! ' + JSON.stringify(error));
        })

}
*/