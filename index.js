var mysql = require("mysql");
var bodyparser = require('body-parser');
var path = require('path');
var ejs = require('ejs');
var session = require('express-session');
var express = require('express');
var bcrypt =require('bcrypt');
var saltRounds =  10;
var passport = require("passport");

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
app.use(session({
    secret:'secret',
    resave:false,
    saveUninitialized:true,
    cookie:{secure:true}
}));

app.use(passport.initialize());
app.use(passport.session());
app.get('/',function(req,res){
    res.render('index',{success:false,errors:req.session.errors});
    req.session.errors=null;
});
connection.query('CREATE TABLE IF NOT EXISTS user(NAME CHAR(255) NOT NULL,EMAIL VARCHAR(255) NOT NULL,PASSWORD VARCHAR(25))',
    function(err){
        console.log(err);
    }
);
app.post('/submit',function(req,res){
    //var obj={};
    var name= req.body.name;
    var email=req.body.email;
    var password=req.body.password;
    var cpassword=req.body.cpassword;
    if(password.length>=6 && cpassword==password){
        bcrypt.hash(password, saltRounds, function(err, hash) {
        let sql="INSERT INTO user VALUES('"+name+"','"+email+"','"+hash+"')";
        connection.query(sql,function(err,results,field){
            if(err){
                console.log(err);
            }
            else{
                console.log(results);
            }
            
           return res.redirect('/');
        });
    });
    }

});
app.post('/login',function(req,res){
    var obj={};
    var email=req.body.email;
    var password=req.body.password;
    
    let sql="SELECT * FROM `user` WHERE `email`='"+email+"';";
    connection.query(sql,function(err,results,field){
        if(err){
            console.log(err);
            return res.redirect('/');
        }
        else{
            console.log(results);
        }
        return res.render('routes/userdb',{user:results,success:false,errors:req.session.errors});
        req.session.errors=null;

    });
    
});
app.set('views',__dirname);

app.set('view engine','ejs');

app.listen('8000',function(){
    console.log('connected');
});