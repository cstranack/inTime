var express = require('express');
var app = express();

//web application getting something from the server
//req = request //res = response //=>'fat arrow' = function
app.get('/', (req, res) => {
    res.send('This is the homepage :D ');

});
//second page
app.get('/about', (req, res) => {
    res.send('This is the about page :D ');

});

//third page
app.get('/contact', (req, res) => {
    res.send('This is the contact page :D ');

});


//listening for requests on port 3000
app.listen(3000,() => {
    console.log(' Server listening on port 3000 :) ');
});