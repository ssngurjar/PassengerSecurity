var express = require('express');
var router = express.Router();
var expressValidator = require('express-validator');
var passport = require('passport');
var mysql = require('mysql');
var bodyParser = require("body-parser");
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({extended:true}));


/* GET login  page. */
router.get('/',function(req, res, next) {
  res.render('login', { title: 'Welcome to Passenger Security Login' });
});

// Logout and get login page again
router.get('/logout',function(req, res, next) {
  req.logout();
  req.session.destroy();
  res.render('login', { title: 'Welcome to Passenger Security Login' });
});

//get grp home page 
router.get('/dashboard2',function(req, res, next) {
	var isAuthorised = null;
	isAuthorised=req.sessionID;
	if(isAuthorised!=null)
   res.render('dashboard2',{title: "GRP Dashboard"});
    else
    	res.render('login',{ title: 'Welcome to Passenger Security Login'});
});

//login authentication 
router.post('/login',passport.authenticate('local',{
	successRedirect: '/dashboard2',
	failureRedirect: '/'
}));

router.post('/closed',function(req,res){
	var cid=req.body.cid;
	 const db=require('../db');
	var sql='UPDATE RPassComp set Status="closed" WHERE Status="pending" AND ComplaintID='+mysql.escape(cid)+''; 
	db.query(sql,function(err){
		if(err)
			res.send("ID Not Found");
	var sql='UPDATE URPassComp set Status="closed" WHERE Status="pending" AND ComplaintID='+mysql.escape(cid)+''; 
	db.query(sql,function(err){
		if(err)
			res.send("ID Not Found");
		res.render('dashboard2',{title: "GRP Dashboard"});
	});
	});
});


passport.serializeUser(function(user_id, done) {
  done(null, user_id);
});

passport.deserializeUser(function(user_id, done) {
    done(null, user_id);
});

function authenticationMiddleware(){
	return (req,res,next)=>{
		console.log('req.session.passport.user: ${JSON.stringify(req.session.passport)}');
		if(req.isAuthenticated()) return next();
		res.redirect('/');
	}
}

module.exports = router;
