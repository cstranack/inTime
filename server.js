//---REQUIRERING----
var express = require('express');
var app = express();
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var handlebars = require('express-handlebars');
var bcrypt = require('bcryptjs');
var passport = require('passport');
var session = require('express-session');
// const axios = require('axios');
const MongoClient = require("mongodb").MongoClient;

//requires a specific function 
var { isAuth } = require('./middleware/isAuth');
require('./middleware/passport')(passport);

//mongoDB connection
const mongoURL = process.env.mongoURL || 'mongodb://localhost:27017/inTime';

// models
var User = require('./models/User');
var Task = require('./models/Task');



//---ROUTES---
app.use(express.static('public'));

app.set('view engine', 'hbs');

app.engine('hbs', handlebars({
    layoutsDir: __dirname + '/views/layouts',
    extname: 'hbs'
}));

//passport connection
app.use(passport.initialize());
app.use(passport.session());

//Database connection
app.use(bodyParser.json());  
app.use(bodyParser.urlencoded({ extended: false }));

//passport
app.use(
    session({
        secret: 'mySecret',
        resave: true,
        saveUninitialized: true,
        //adding a logged in timelimit
        cookie: { maxAge: 600000 }
    })
);

app.use(passport.initialize());
app.use(passport.session());



//--PAGES--
//web application requesting login page
//req = request // res = response // =>'fat arrow' = function
app.get('/', (req, res) =>{
    res.render('login', {layout: 'public' });
});

app.get('/logout', (req, res) =>{
    req.logout();
    res.render('login', {layout: 'public' });
});


app.get('/signup', (req, res) =>{
    res.render('signup', {layout: 'public' });
});

app.get('/newtask', isAuth, (req, res) =>{
    res.render('newtask', {layout: 'main', username: req.user.username });
});

var date = "2020-05-28T16:00:00.000+00:00";

app.get('/taskhistory', isAuth, (req, res) =>{
    Task.find({user: req.user.id}).lean()
    .exec((err, tasks) =>{
        if(tasks.length){
            res.render('taskhistory', { layout: 'main', tasks: tasks, tasksExist: true, username: req.user.username });
        } else{
            res.render('taskhistory', { layout: 'main', tasks: tasks, tasksExist: false, username: req.user.username });
        }  
    });
});

// tasks: req.status="Active"

app.get('/index', isAuth, (req, res) => {
    // here the code is just finding entries related to the logged in user
    // they both share the same id 
    Task.find({user: req.user.id, }).lean()
    .exec((err, tasks) =>{
        if(tasks.length){
            res.render('index', { layout: 'main', tasks: tasks, tasksExist: true, username: req.user.username });
        } else{
            res.render('index', { layout: 'main', tasks: tasks, tasksExist: false, username: req.user.username });
        }  
    });
});



// adding a task
app.post('/addtask', (req, res) =>{
    const { taskName, taskDetails, taskOrEvent, deadline, taskLength } = req.body;
    var task = new Task({
        user: req.user.id,
        taskName,
        taskDetails,
        taskOrEvent,
        deadline,
        taskLength
    });

    task.save();
    // prevent hanging, redirect back to home page
    res.redirect('/newtask?taskadded');
});


//async function used here (for security)
//prevents a user making 2 accounts with the same email
// sending username and password to database
app.post('/createuser', async (req, res) => {
    const { username, password } = req.body;
    try {
        //checks if email already exisits
        let user = await User.findOne({ username });

        if(user) {
            //if it does, gives feedback and doesnt send to database
            //400 = bad request - user already exists
            return res.status(400).render('signup', {layout: 'public', userExist: true});
        }
        user = new User({
            username,
            password
        });
        
        //salt is a type of encryption that adds characters to the end of a password
        const salt = await bcrypt.genSalt(10);
        //encrypting the password
        user.password = await bcrypt.hash(password, salt);
    
        await user.save();
        // prevent hanging, redirect back to home page
        res.status(200).render('signup', {layout: 'public', userDoesNotExist: true});
    } catch(err){
        //if theres an error, stop the code and feedback to client
        console.log(err.message);
        res.status(500).send('Server Error')
    }
})


//finding a user in the user database and matching and entered 
//username and password to exisiting ones.
app.post('/login', (req, res, next) => {
    try{
        passport.authenticate('local', {
            //if successful- user taken to dashboard
            successRedirect: '/index',
            //if failure query incorrectLogin
            failureRedirect: '/?incorrectLogin'
        })(req, res, next)
    } catch(err){
        console.log(err.message);
        res.status(500).send('Server Error')
    }
});


// This uses URL parameter to pass a date to the server from the client
app.get('/getdate/:date', async (req, res) => {
    console.log(req.params.date);
    //This queries the database and looks for an entry that has our passed in date in it.
    let task = await Task.find({ deadline: { "$in": req.params.date } });
    console.log(task);
    res.json(task);
});



// app.post("/completedTask", (req, res) => {
//     var id = req.params.id;
//     db.collection("tasks").deleteOne({ _id: new mongoose.ObjectId(id) }, (err, obj) => {
//         if (err) throw err;
//         console.log(`Successfully Deleted Post with id of ${id}`);
//         res.redirect("/index");
//     });
//   });



mongoose.connect(mongoURL, {
    useUnifiedTopology: true,
    useNewUrlParser: true
})
.then(() => {
    console.log('Connected to the DB :)');
})
.catch((err) => {
    console.log('Not connected to the DB with err: ' + err);
});


//listening for requests on port 3000
app.listen(3000,() => {
    console.log('Server listening on port 3000 :) ');
});





// mongoose.connect(mongoURL, function(err, db){
//     if (err) throw err;
//     var dbo = db.db("mydb");
//     var query = { deadline: "2020-05-28T16:00:00.000+00:00" };
//         dbo.collection("tasks").find(query).toArray(function(err, result) {
//         if (err) throw err;
//         console.log(result);
//         db.close();
//       });

// })



// if( {{deadline }} = "2020-02-20T17:00:00.000+00:00"){

// }
 

// axios.get('/tasks', {
//     params: {
//       deadline: "2020-05-28"
//     }
//   })
//   .then(function (response) {
//     document.getElementById("taskListItem2").innerHTML = response;
//     console.log(response);
//   })
//   .catch(function (error) {
//     console.log(error);
//   })
//   .then(function () {
//     // always executed
//   });  