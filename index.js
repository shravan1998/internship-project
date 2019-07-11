var mysql = require("mysql");
var bodyparser = require('body-parser');
var path = require('path');
var ejs = require('ejs');
var session = require('express-session');
var express = require('express');
var bcrypt =require('bcrypt');
var saltRounds =  10;
var passport = require("passport");
var flash = require("connect-flash");
var MySqlStore = require('express-mysql-session')(session);
var LocalStrategy = require("passport-local").Strategy;
const connection = mysql.createConnection({
    host:'localhost',
    username:'root',
    password:'',
    database: 'internship'   
});
var options={
        host:'localhost',
        username:'root',
        password:'',
        database: 'internship'   
};
var sessionStore = new MySqlStore(options);
const app  = express();
app.use(flash());
app.use(bodyparser.urlencoded({extended:true}));
app.use(bodyparser.json());

app.use(express.static(__dirname+'/'));
app.use(session({
    secret:'sjhdisjjjlhl',
    resave:false,
    saveUninitialized:false,
    store:sessionStore,
    http:true
    //cookie:{secure:true}
}));

app.use(passport.initialize());
app.use(passport.session());
app.get('/',function(req,res){
    res.render('index');
    
});
app.get('/home',authenticationMiddleware (),function(req,res){
    res.render('routes/home',{success:false,errors:req.session.errors});
    req.session.errors=null;
});
passport.use(new LocalStrategy({
    username:'username',
    password:'password',
    passReqToCallback:true
    },
    function(req,username, password, done) {
     console.log(username);
     console.log(password);
     let sql="SELECT password FROM user WHERE `EMAIL`='"+username+"';"
    connection.query(sql,function(err,results,fields){
        if(err){
            done(err);
        }
        if(results.length === 0){
            done(null,false);
        }
        const hash=results[0];
        bcrypt.compare(password,hash,function(err,response){
            if(response === true){
                return done(null,{user_id: 43});
            }
            else{
                done(null,false);
            }
        });
    });
     return done(null, 'login success');
      
    }
  ));
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
            connection.query('SELECT LAST_INSERT_ID() AS user_id',function(err,results,fields){
                if(err){
                    console.log(err);
                }
                const user_id=results[0];
                req.logIn(user_id,function(err){
                    return res.redirect('/');
                });
                
            });
        });
    });
    }

});
passport.serializeUser(function(user_id,done){
    done(null,user_id);
});
passport.deserializeUser(function(user_id,done){
    done(null,user_id);
});
function authenticationMiddleware () {  
	return (req, res, next) => {
		console.log(`req.session.passport.user: ${JSON.stringify(req.session.passport)}`);

	    if (req.isAuthenticated()) return next();
	    res.redirect('/')
	}
}
app.post('/login',
passport.authenticate('local',{
    successRedirect:'/home',
    failureRedirect:'/',
    failureFlash:true
}));
app.set('views',__dirname);

app.set('view engine','ejs');

app.listen('8000',function(){
    console.log('connected');
});