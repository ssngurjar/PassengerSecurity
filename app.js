var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookie = require('cookie');
var cookieParser = require('cookie-parser');
var mysql = require('mysql');
var socket = require('socket.io');
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');

//Authentication packages
var session=require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var MySQLStore = require('express-mysql-session')(session);
var RedisStore = require("connect-redis")(session);

var app = express();
var ipaddr = process.env.VCAP_HOST;
var port=process.env.VCAP_PORT;
var server = require('http').Server(app);
server.listen(3001,function(){
    console.log('listening for requests on port 3001,');
});

require('dotenv').config();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(expressValidator());
app.use(cookieParser());
var index = require('./routes/index');
var users = require('./routes/users');
app.use(express.static(path.join(__dirname, 'public')));

var options = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database : process.env.DB_NAME,
  socketPath:'/var/run/mysqld/mysqld.sock'

};

var sessionStore = new MySQLStore(options);
var sessionMiddleware=session({
  secret: 'zyxwvu',
  resave: false,
  store:sessionStore,
  saveUninitialized: false,
 // cookie: { secure: true }
});


var io = socket(server);
io.use(function(socket, next) {
    sessionMiddleware(socket.request, socket.request.res, next);
});

app.use(sessionMiddleware);



app.use(passport.initialize());
app.use(passport.session());

app.use('/', index);
app.use('/users', users);

//railway station authentication using local passport strategy
passport.use(new LocalStrategy(
  function(username, password, done) {

    //database connection
    const db=require('./db');

    //query to get username and password corresponding to a user
    db.query('SELECT * FROM GRPLoginData WHERE User_Name=?',[username],function(err,results,fields){
        if(err) {done(err)};
        
        if(results.length==0){
        done(null,false);
        }

       else{
        if(results[0].Password==password){
        return done(null,{user_id: results[0].User_Name});
       }
       else{
        return done(null,false);
       }

       }

    });
  }

));

var clients={};

io.on('connection', (socket) => {

  //console.log('sessionID ' + socket.request.sessionID);
   // console.log('made socket connection', socket.id);

    socket.on('getcomplaints', function(data){
       var users={};
       const con=require('./db');
       const sid=socket.request.sessionID;


        //query to select station code from sessions user_id
       con.query("SELECT SUBSTR(data,108,3) as stscode FROM sessions where session_id=?",[sid],function(err,stcode){
             if(err) throw err;
             const stco=stcode[0].stscode;
             users[stco]=socket.id;
             clients[socket.id]=socket;

              //query to get station name from station code
             con.query("SELECT Station_Name FROM StationCodes where Station_Code=?",[stco],function(err,results){
                if(err) throw err;
                var stname=results[0].Station_Name;
                var sql="SELECT  PNR as TicketNo_PNR,ComplaintID,Full_Name,Train_No,Phone_No,Type_Of_Crime,Crime_Details,Status,Expected_Arrival,Feedback,Date FROM RPassComp where status='"+data+"'AND Next_Halt="+mysql.escape(stname)+"union SELECT  Ticket_No as TicketNo_PNR,ComplaintID,Full_Name,Train_No,Phone_No,Type_Of_Crime,Crime_Details,Status,Expected_Arrival,Feedback,Date FROM URPassComp where status='"+data+"'AND Next_Halt="+mysql.escape(stname)+"";
                
                //query to get complaints specific to a railway station
                con.query(sql,function(err,result){
                    if(err) throw err;
                    var sql1='UPDATE RPassComp set status="pending" WHERE Status="new" AND Next_Halt='+mysql.escape(stname)+'';
                    
                    //query to update status of complaint when new button is clicked
                    con.query(sql1,function(err){
                       if(err) throw err;    
                     });
                     var sql2='UPDATE URPassComp set status="pending" WHERE Status="new" AND Next_Halt='+mysql.escape(stname)+'';
                    
                    //query to update status of complaint when new button is clicked
                    con.query(sql2,function(err){
                       if(err) throw err;    
                     });
               // console.log('Data received from Db:\n');
               // console.log(result);  

                if (users[stco]) {
                //Emitting data to particular railway station
               clients[users[stco]].emit('getcomplaints',result); 
               }
               });
              });

             //code to disconnect socket
            socket.on('disconnect', function () {
              delete clients[socket.id]; // remove the client from the array
              delete users[stco]; // remove connected user & socket.id
              console.log('disconnected'+socket.id);
              });
      });

    });

});

io.on('connection', (socket) => {

  //console.log('sessionID ' + socket.request.sessionID);
  //  console.log('made socket connection', socket.id);

    socket.on('getclosed', function(data){
       var users={};
       const con=require('./db');
       const sid=socket.request.sessionID;

        //query to select station code from sessions user_id
       con.query("SELECT SUBSTR(data,108,3) as stscode FROM sessions where session_id=?",[sid],function(err,stcode){
             if(err) throw err;
             const stco=stcode[0].stscode;
             users[stco]=socket.id;
             clients[socket.id]=socket;

              //query to get station name from station code
             con.query("SELECT Station_Name FROM StationCodes where Station_Code=?",[stco],function(err,results){
                if(err) throw err;
                var stname=results[0].Station_Name;
                var sql="SELECT  PNR as TicketNo_PNR,ComplaintID,Full_Name,Train_No,Phone_No,Type_Of_Crime,Crime_Details,Status,Expected_Arrival,Feedback,Date FROM RPassComp where status='"+data+"'AND Next_Halt="+mysql.escape(stname)+"union SELECT  Ticket_No as TicketNo_PNR,ComplaintID,Full_Name,Train_No,Phone_No,Type_Of_Crime,Crime_Details,Status,Expected_Arrival,Feedback,Date FROM URPassComp where status='"+data+"'AND Next_Halt="+mysql.escape(stname)+"";
                 
                //query to get complaints specific to a railway station
                con.query(sql,function(err,result){
                    if(err) throw err;
      
               // console.log('Data received from Db:\n');
               // console.log(result);  

                if (users[stco]) {
                //Emitting data to particular railway station
               clients[users[stco]].emit('getclosed',result); 
               }
               });
              });

             //code to disconnect socket
            socket.on('disconnect', function () {
              delete clients[socket.id]; // remove the client from the array
              delete users[stco]; // remove connected user & socket.id
              console.log('disconnected'+socket.id);
              });
      });

    });

});



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


// Handlebars default config
const hbs = require('hbs');
const fs = require('fs');

const partialsDir = __dirname + '/views/partials';

const filenames = fs.readdirSync(partialsDir);

filenames.forEach(function (filename) {
  const matches = /^([^.]+).hbs$/.exec(filename);
  if (!matches) {
    return;
  }
  const name = matches[1];
  const template = fs.readFileSync(partialsDir + '/' + filename, 'utf8');
  hbs.registerPartial(name, template);
});

hbs.registerHelper('json', function(context) {
    return JSON.stringify(context, null, 2);
});


module.exports = app;
