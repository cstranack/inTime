//---REQUIRERING----
var express = require('express');
var app = express();
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var handlebars = require('express-handlebars');
var bcrypt = require('bcryptjs');
var passport = require('passport');
var session = require('express-session');
const axios = require('axios');
require('./middleware/passport')(passport);

//mongoDB connection
const mongoURL = process.env.mongoURL || 'mongodb://localhost:27017/inTime';

// models
var User = require('./models/User');
var Task = require('./models/Task');

app.use(express.static('public'));

//---ROUTES---
app.set('view engine', 'hbs');

app.engine('hbs', handlebars({
    layoutsDir: __dirname + '/views/layouts',
    extname: 'hbs'
}));

//Database connection
app.use(bodyParser.json());  
app.use(bodyParser.urlencoded({ extended: false }));


//passport
app.use(
    session({
        secret: 'mySecret',
        resave: true,
        saveUninitialized: true,
        //addind a logged in timelimit
        cookie: { maxAge: 60000 }
    })
);

app.use(passport.initialize());
app.use(passport.session());



//--PAGES--
//web application requesting login page
//req = request // res = response // =>'fat arrow' = function
app.get('/', (req, res) =>{
    // req.logout();
    res.render('login', {layout: 'public' });
});

app.get('/signup', (req, res) =>{
    res.render('signup', {layout: 'public' });
});

app.get('/newtask', (req, res) =>{
    res.render('newtask', {layout: 'main' });
});

app.get('/taskhistory', (req, res) =>{
    res.render('taskhistory', {layout: 'main' });
});

app.get('/index', (req, res) =>{
    res.render('index', {layout: 'main' });
});


// adding a task
app.post('/addtask', (req, res) =>{
    const { taskName, taskDetails, taskOrEvent, deadline, taskLength } = req.body;
    var task = new Task({
        // user: req.user.id,
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

// taskYN,
// eventYN,


// isAuth,

app.get('/index',  (req, res) => {
    // here the code is just finding entries related to the logged in user
    // they both share the same id 
    Task.find({ task: req.user.id }).lean()
    .exec((err, tasks) =>{
        if(tasks.length){
            res.render('index', { layout: 'main', tasks: tasks, tasksExist: true, username: req.user.username });
        } else{
            res.render('index', { layout: 'main', tasks: tasks, tasksExist: false, username: req.user.username });
        }  
    });
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
            //400 = bad request - user aleardy exists
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