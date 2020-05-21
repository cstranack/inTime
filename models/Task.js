var mongoose = require('mongoose');

//A scheme is used to structure data, here we make a structure based around the form that is going
//to be used in our front end files, so that we can save that data to our database.

const TaskSchema = new mongoose.Schema({
    taskName: {
        type: String
    },
    taskDetails: {
        type: String
    },
    // taskYN: {
    //     type: Boolean
    // },
    // eventYN: {
    //     type: Boolean
    // },
    deadline: {
        type: Date
    },
    taskLength:{
        type: Number
    },
    dateAdded: {
        type: Date,
        defult: Date.now
    }
});

//We use module.exports to 'expose' this module, so that we can call it in different files of our project
module.exports = Task = mongoose.model('task', TaskSchema);