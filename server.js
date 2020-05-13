var express = require('express');
var app = express();
var handlebars = require('express-handlebars');

app.set('view engine', 'hbs');
app.engine('hbs', handlebars({
    layoutsDir: __dirname + '/views/layouts',
    extname: 'hbs'
}));

//web application requesting login page
//req = request // res = response // =>'fat arrow' = function
app.get('/', (req, res) =>{
    res.render('index', {layout: 'main' });
});

//listening for requests on port 3000
app.listen(3000,() => {
    console.log('Server listening on port 3000 :) ');
});