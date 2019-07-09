var mysql = require("mysql");
var bodyparser = require('body-parser');
var path = require('path');
var ejs = require('ejs');
var session = require('express-session');
var express = require('express');
var validator = require('express-validator');

const connection = mysql.createConnection({
    host:'localhost',
    username:'root',
    password:'',
    database: 'internship'   
});

const app  = express();

app.use(bodyparser.urlencoded({extended:false}));

app.use(bodyparser.json());

app.use(express.static(__dirname+'/'));

app.get('/',function(req,res){
    res.render('index');
});
app.post('/',function(req,res){
    var username = req.body.name;
    var email = req.body.email;
    var password = req.body.password;
    var cpassword = req.body.cpassword;
}
);
app.set('views',__dirname);

app.set('view engine','ejs');

app.listen('8000',function(){
    console.log('connected');
});