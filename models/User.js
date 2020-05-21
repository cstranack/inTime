var mongoose = require('mongoose');

//A scheme is used to structure data, here we make a structure based around the form that is going
//to be used in our front end files, so that we can save that data to our database.

const UserSchema = new mongoose.Schema({
    username: {
        type: String
    },
    password: {
        type: String
    },
    date: {
        type: Date,
        defult: Date.now
    }
});

//We use module.exports to 'expose' this module, so that we can call it in different files of our project
module.exports = User = mongoose.model('user', UserSchema);