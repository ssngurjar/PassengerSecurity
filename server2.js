var express = require("express");
var request = require('request');
var multer = require('multer');
var app = express();
var path = require("path");
var mysql = require('mysql');
var bodyParser = require("body-parser");
var stringify = require('json-stringify');
var dateTime = require('node-datetime');
var dt = dateTime.create();
var socket = require('socket.io');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));


 app.use(express.static("public"));

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "S15103019",
  database: "PassengerSecurity"
});


con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});
// var distance = require('google-distance-matrix');
 var distance = require('google-distance');

 //io request serving for next halt
var ipaddr = '192.168.43.248';
var server = require('http').Server(app);
server.listen(3002,function(){
    //console.log('listening for requests on port 3001,');
});


app.get('/',function(req,res){
	res.sendFile(path.join(__dirname+'/index.html'));
});

app.get('/AboutUs',function(req,res){
	res.sendFile(path.join(__dirname+'/AboutUs.html'));
});

app.get('/helplineweb',function(req,res){
	res.sendFile(path.join(__dirname+'/helpline.html'));
});

app.get('/reservedweb',function(req,res){
	res.sendFile(path.join(__dirname+'/reservesnew.html'));
});

app.get('/unreservedweb',function(req,res){
	res.sendFile(path.join(__dirname+'/unreserved.html'));
});

app.get('/checkstatusweb',function(req,res){
	res.sendFile(path.join(__dirname+'/checkstatus.html'));
});

var Storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, "/home/ssngurjar/Desktop/demo3/grpsidemain/public/images");
    },
    filename: function (req, file, callback) {
		filename=file.fieldname + "_" + Date.now() + "_" + file.originalname;
		//console.log(filename);
		//console.log(b);
        callback(null,filename);
    }
});

var upload = multer({ storage: Storage }).array("imgUploader", 3); //Field name and max count

app.post("/file/upload", function (req, res) {
    upload(req, res, function (err) {
        if (err) {
           res.status(200).json({
            message:"Something went wrong"
            });
     res.end();
   }
   else{
    res.status(200).json({
            message:"Image uploaded successfully"
            });
     res.end();
   }
		
		
    });
	b=50;
});

app.get('/stations', function(req, res) {
   var sql="SELECT * FROM StationCodes";
      con.query(sql,function(err,result){
         if(err) throw err;
      console.log('Data received from Db:\n');
           var Stations={};
           for(var i=0;i<result.length;i++)
            Stations[i]=result[i].Station_Name;
           console.log(Stations);
           res.json(Stations);
      res.end();
});
  });
app.post("/getroute", function (req, res) {
	var routes={};
   var PNRN=req.body.PNR;
   console.log(PNRN);
  var FetchTrainNo="SELECT * FROM PNRDB WHERE PNR="+ mysql.escape(PNRN)+";";
      con.query(FetchTrainNo,function(err,row,fields){
         if(err) {
            new Error("PNR NOT FOUND");
             res.end(); }

         else{
           if(row[0]==null){
            res.send("No PNr found");
            new Error("No PNR FOUND");
           }
           else
              { TrainNo=row[0].Train_No;
               Berth_No=row[0].Berth;
               Source=row[0].Source;
               Destination=row[0].Destination;
              request({url:'https://api.railwayapi.com/v2/route/train/'+TrainNo+'/apikey/zw5a3eaet5/',json: true}, function(err, response, json) {
              if (err) {
               //throw err;
               res.send("cannt get route try again");
               }
             var lengths=json.route;
             
             var count = Object.keys(lengths).length;
             for (var i = 0; i <count; i++) {
             var empty=JSON.stringify(json.route[i].station.name);
             routes[i]=empty; 
           }
           console.log(routes[0]); 
           res.json(routes);
             res.end(); 
          });
            }
          }
      
         }); 
             
    
});


app.post('/reservedweb', function (req, res) {
  var date=dt.format('d/m/Y H:M:S');
 //console.log(filename);
 //console.log(TrainNo);console.log(Berth_No);console.log(Source);

console.log(req.body);
  var createStudent = {
    PNR: req.body.PNR,
	Full_Name: req.body.fullname,
	Train_No:""+TrainNo+"",
	Berth_No:""+Berth_No+"",
	Source:""+Source+"",
	Destination:""+Destination+"",
	Phone_No:req.body.phone,
    Current_Location:req.body.loc,
    Next_Halt:req.body.nexthalt,
	Type_Of_Crime:req.body.crimetype,
	Crime_Details:req.body.crimedetails,
	Status:"new",
	Expected_Arrival:"",
	Feedback:"",
	Date:""+date+"",
	Image:""+filename+""
   }
    con.query('INSERT INTO RPassComp SET ?', createStudent, function (err, resp) {
     if (err) throw err;
     // if there are no errors send an OK message.
	var FetchID="SELECT ComplaintId FROM RPassComp ORDER BY ComplaintId DESC LIMIT 1;";
	 con.query(FetchID,function(err,row,fields){
		 if(err)throw err;
		 else{
			var complaintid=row[0].ComplaintId;
			console.log(complaintid);
		  /* var Set_Arrival='UPDATE URPassComp set Expected_Arrival='+mysql.escape(Arrival)+' WHERE ComplaintId='+mysql.escape(complaintid)+'';
            con.query(Set_Arrival,function(err,result){
           if(err) throw err;
           console.log(err);
		});*/
		 res.status(200).json({
            message:"Complaint Registered with Complaint Id : "+complaintid
            });}
	   res.end();
   });   
     console.log(err);
   });
   
   
   
 });

 
app.post('/unreservedweb', function (req, res) {
  // this is where you handle the POST request.
  var date=dt.format('d/m/Y H:M:S'); 
  var createStudent = {
    Ticket_No:req.body.ticketno,
	Full_Name: req.body.fullname,
	Train_No:req.body.trainno,
	Source:req.body.source,
	Destination:req.body.destination,
	Phone_No:req.body.phone,
  Current_Location:req.body.loc,
  Next_Halt:req.body.nexthalt,
	Type_Of_Crime:req.body.crimetype,
	Crime_Details:req.body.crimedetails,
	Status:"new",
	Expected_Arrival:"",
	Feedback:"",
  Date:""+date+""
	
   }
console.log(createStudent.Date);
var Origin = JSON.stringify(createStudent.Current_Location);
/*var Destination = JSON.stringify(createStudent.Next_Halt);
 distance.get(
  {
    origin: [Origin],
    destination: [Destination],
  mode: 'train'
  },
  function(err, data) {
    if (err) return console.log(err);
  var formatted1 = dt.format('H');
  var formatted2 = dt.format('M');
  var h=Number(formatted1);
  var m=Number(formatted2);
  var Duration=Math.floor((data.durationValue)/60);
  var hour=Math.floor(Duration/60);
  var minutes=Math.floor(Duration%60);
  var oh=Math.floor((m+minutes)/60);
  var Minutes=((m+minutes)%60);
  var Days=Math.floor((h+hour+oh)/24);
  var Hour=((h+hour+oh)%24);
  var Arrival=+Days+"Days "+Hour+"hours "+Minutes+"Minutes";*/
     // now the createStudent is an object you can use in your database insert logic.
     con.query('INSERT INTO URPassComp SET ?', createStudent, function (err, resp) {
     if (err) throw err;
     // if there are no errors send an OK message.
	var FetchID="SELECT ComplaintId FROM URPassComp ORDER BY ComplaintId DESC LIMIT 1;";
	 con.query(FetchID,function(err,row,fields){
		 if(err)throw err;
		 else{
			var complaintid=row[0].ComplaintId;
			console.log(complaintid);
		   /* var Set_Arrival='UPDATE URPassComp set Expected_Arrival='+mysql.escape(Arrival)+' WHERE ComplaintId='+mysql.escape(complaintid)+'';
            con.query(Set_Arrival,function(err,result){
           if(err) throw err;
           console.log(err);
		});*/
		 res.write("<html><head></head><body>Your FIR Registered Successfully and Your Complaint id is:"+complaintid+"<br>(please remember your complaint ID for further information) <body></html>");}
	   res.end();
   });   
     console.log(err);
   });
   
   console.log("hy");
   
 });
 
 
app.post('/checkstatusweb', function (req, res) {
  // this is where you handle the POST request. 
  var cid=req.body.complaint;
  console.log(cid);
	var sql="SELECT Status FROM RPassComp where ComplaintID="+ mysql.escape(cid)+" union SELECT Status FROM URPassComp where ComplaintID ="+ mysql.escape(cid)+";";
  con.query(sql,function(err,row,fields){
		if(err){
      console.log(err);
			res.end(err);}
		else if(!row.length)
		res.end("pareshan mat kr nhi hai teri id");
	    else{
        console.log(row.length);
			var r=row[0].Status;
     console.log(r);
      console.log(cid);
      res.status(200).json({
            message:"Your current status is :- "+r
            });
     res.end();
   }
    
		
	});   
 });

app.post("/Getroutes", function (req, res) {
  var routes={};
   var trainNumber=req.body.trainNumber;
   console.log(trainNumber);
  
              request({url:'https://api.railwayapi.com/v2/route/train/12903/apikey/zw5a3eaet5/',json: true}, function(err, response, json) {
              if (err) {
               throw err;
               }
               console.log(json.route)
             var lengths=json.route;  
            var count = Object.keys(lengths).length;
             for (var i = 0; i <count; i++) {
             var empty=JSON.stringify(json.route[i].station.name);
             routes[i]=empty; 
           }
           console.log(routes[0]); 
           res.json(routes);
             res.end(); 
          });             
    
});






/*app.post('/checkstatus', function (req, res) {
  // this is where you handle the POST request. 
  var cid=req.body.complaint;
  console.log(cid);
  var sql="SELECT Status FROM RPassComp where ComplaintID="+ mysql.escape(cid)+" union SELECT Status FROM URPassComp where ComplaintID ="+ mysql.escape(cid)+";";
  con.query(sql,function(err,row,fields){
    if(err){
      console.log(err);
      res.end(err);}
    else if(!row.length){
    res.json({
            message:"Your Id Does not exists you haven't filed any FIR"
            });
       res.end();
   }
      else{
        console.log(row.length);
      var r=row[0].Status;
     console.log(r);
      console.log(cid);
      //res.write("<html><head></head><body><h3>Your FIR Status is :<b>"+r+"<b></h3><br><br> <body></html>");
      res.status(200).json({
            message:"Your current status is : "+r
            });
      res.end();
    }
  });   
 });*/
 app.post('/checkstatus', function (req, res) {
  // this is where you handle the POST request. 
  var cid=req.body.complaintId;
  console.log(cid);
  var sql="SELECT Status FROM RPassComp where ComplaintID="+ mysql.escape(cid)+" union SELECT Status FROM URPassComp where ComplaintID ="+ mysql.escape(cid)+";";
  con.query(sql,function(err,row,fields){
    if(err){
      console.log(err);
      res.end(err);}
    else if(!row.length){
    res.json({
            message:"Your Id Does not exists you haven't filed any FIR"
            });
       res.end();
   }
      else{
        console.log(row.length);
      var r=row[0].Status;
     console.log(r);
      console.log(cid);
      //res.write("<html><head></head><body><h3>Your FIR Status is :<b>"+r+"<b></h3><br><br> <body></html>");
      res.status(200).json({
            message:"Your current status is : "+r
            });
      res.end();
    }
  });   
 });
app.post('/reserved',function(req,res){
  var date=dt.format('d/m/Y H:M:S');
    var createComplaint = {
    PNR: req.body.pnr,
  Full_Name: req.body.fullName,
  Train_No:req.body.trainNumber,
  Berth_No:req.body.berth,
  Source:req.body.source,
  Destination:req.body.destination,
  Phone_No:req.body.phoneNumber,
    Current_Location:req.body.currentLocation,
  //Current_Location:"Jaipur",
    Next_Halt:req.body.nextHalt,
  Type_Of_Crime:req.body.typeOfCrime,
  Crime_Details:req.body.crimeDescription,
  Status:"new",
  Expected_Arrival:"",
  Feedback:"",
    Date:""+date+""
  
   }
   console.log(createComplaint.Next_Halt);
/*var Origin = JSON.stringify(createComplaint.Current_Location);
var Destination = JSON.stringify(createComplaint.Next_Halt);
 distance.get(
  {
    origin: [Origin],
    destination: [Destination],
  mode: 'train'
  },
  function(err, data) {
    if (err) return console.log(err);
  var formatted1 = dt.format('H');
  var formatted2 = dt.format('M');
  var h=Number(formatted1);
  var m=Number(formatted2);
  var Duration=Math.floor((data.durationValue)/60);
  var hour=Math.floor(Duration/60);
  var minutes=Math.floor(Duration%60);
  var oh=Math.floor((m+minutes)/60);
  var Minutes=((m+minutes)%60);
  var Days=Math.floor((h+hour+oh)/24);
  var Hour=((h+hour+oh)%24);
  var Arrival=+Days+"Days "+Hour+"hours "+Minutes+"Minutes";*/
     // now the createStudent is an object you can use in your database insert logic.
     con.query('INSERT INTO RPassComp SET ?', createComplaint, function (err, resp) {
     if (err) throw err;
     // if there are no errors Data  Inserted successfully .
       var FetchID="SELECT ComplaintId FROM RPassComp ORDER BY ComplaintID DESC LIMIT 1;";
   con.query(FetchID,function(err,row,fields){
     if(err)throw err;
     else{
      var complaintid=row[0].ComplaintId;
        /*var Set_Arrival='UPDATE RPassComp set Expected_Arrival='+mysql.escape(Arrival)+' WHERE ComplaintID='+mysql.escape(complaintid)+'';
            con.query(Set_Arrival,function(err,result){
           if(err) throw err;
            });*/
            res.status(200).json({
            message:"Complaint Registered with Complaint Id : "+complaintid
            });
          res.end();
           }
   });   
    
   });
   
   console.log("Data inserted successfully,Bhai hoshiyar nikla tu to");
   
 });
app.post('/unreserved',function(req,res){
  var date=dt.format('d/m/Y H:M:S');
    var createComplaint = {
    Ticket_No: req.body.ticketno,
  Full_Name: req.body.fullName,
  Train_No:req.body.trainNumber,
  Source:req.body.source,
  Destination:req.body.destination,
  Phone_No:req.body.phoneNumber,
    Current_Location:req.body.currentLocation,
    Next_Halt:req.body.nextHalt,
  Type_Of_Crime:req.body.typeOfCrime,
  Crime_Details:req.body.crimeDescription,
  Status:"new",
  Expected_Arrival:"",
  Feedback:"",
    Date:""+date+""
  
   }
   console.log(createComplaint.Next_Halt);
/*var Origin = JSON.stringify(createComplaint.Current_Location);
var Destination = JSON.stringify(createComplaint.Next_Halt);
 distance.get(
  {
    origin: [Origin],
    destination: [Destination],
  mode: 'train'
  },
  function(err, data) {
    if (err) return console.log(err);
  var formatted1 = dt.format('H');
  var formatted2 = dt.format('M');
  var h=Number(formatted1);
  var m=Number(formatted2);
  var Duration=Math.floor((data.durationValue)/60);
  var hour=Math.floor(Duration/60);
  var minutes=Math.floor(Duration%60);
  var oh=Math.floor((m+minutes)/60);
  var Minutes=((m+minutes)%60);
  var Days=Math.floor((h+hour+oh)/24);
  var Hour=((h+hour+oh)%24);
  var Arrival=+Days+"Days "+Hour+"hours "+Minutes+"Minutes";*/
     // now the createStudent is an object you can use in your database insert logic.
     con.query('INSERT INTO URPassComp SET ?', createComplaint, function (err, resp) {
     if (err) throw err;
     // if there are no errors Data  Inserted successfully .
       var FetchID="SELECT ComplaintId FROM URPassComp ORDER BY ComplaintID DESC LIMIT 1;";
   con.query(FetchID,function(err,row,fields){
     if(err)throw err;
     else{
      var complaintid=row[0].ComplaintId;
       /* var Set_Arrival='UPDATE URPassComp set Expected_Arrival='+mysql.escape(Arrival)+' WHERE ComplaintID='+mysql.escape(complaintid)+'';
            con.query(Set_Arrival,function(err,result){
           if(err) throw err;
            });*/
            res.status(200).json({
            message:"Complaint Registered with Complaint Id : "+complaintid
            });
          res.end();
           }
   });   
    
   });
   
   console.log("Data inserted successfully,Bhai hoshiyar nikla tu to");
   
 });