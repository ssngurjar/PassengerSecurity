var socket = io.connect('http://localhost:3001');

// Query DOM
var  btn1 = document.getElementById('new'),
     btn2 = document.getElementById('pending'),
     btn3 = document.getElementById('closed'),
     btn4 = document.getElementById('missed'),
     output = document.getElementById('output');
     
      

// Emit events when new button is clicked
btn1.addEventListener('click', function(){
  socket.emit('getcomplaints', btn1.id);
});

// Emit events when pending button is clicked
btn2.addEventListener('click', function(){
  socket.emit('getcomplaints', btn2.id);
});

// Emit events when close button is clicked
btn3.addEventListener('click', function(){
  socket.emit('getclosed', btn3.id);
});

// Emit events when missed button is clicked
btn4.addEventListener('click', function(){
  socket.emit('getcomplaints', btn4.id);
});

socket.on('getcomplaints', function(rows) {

  for (var i=0; i<rows.length; i++) {
  output.innerHTML+='<tr class="info"><td align="left">'+rows[i].ComplaintID +'</td><td align="left">'+rows[i].Type_Of_Crime +'</td><td align="left">'+rows[i].Train_No+'</td><td align="left">'+rows[i].Expected_Arrival+'</td><td align="left">'+rows[i].Status +'</td><td align="left">'+rows[i].Date +'</td></tr><tr><td colspan=4 align="left"><details><summary>Open Details</summary><li><b>Complaint ID: </b>'+rows[i].ComplaintID+'</li><li><b>PNR/Ticket No: </b>'+rows[i].TicketNo_PNR+'</li><li><b>Full Name: </b>'+rows[i].Full_Name+'</li><li><b>Train No.: </b>'+rows[i].Train_No+'</li><li><b>Phone No.: </b>'+rows[i].Phone_No+'</li><li><b>Type of Crime: </b>'+rows[i].Type_Of_Crime+'</li><li><b>Crime Details: </b>'+rows[i].Crime_Details+'</li><li><b>Feedback: </b>'+rows[i].Feedback+'<form action="/closed" method="post"><label for="ComplaintId ">Enter ComplaintId to close Complaint:</label><input type="text" name="cid" id= "cid"> <input type="submit" value="Close"></form></li></p> </div></details></td></tr>';   
   }     
   });
socket.on('getclosed', function(rows) {

  for (var i=0; i<rows.length; i++) {
  output.innerHTML+='<tr class="info"><td align="left">'+rows[i].ComplaintID +'</td><td align="left">'+rows[i].Type_Of_Crime +'</td><td align="left">'+rows[i].Train_No+'</td><td align="left">'+rows[i].Expected_Arrival+'</td><td align="left">'+rows[i].Status +'</td><td align="left">'+rows[i].Date +'</td></tr><tr><td colspan=4 align="left"><details><summary>Open Details</summary><li><b>Complaint ID: </b>'+rows[i].ComplaintID+'</li><li><b>PNR/Ticket No: </b>'+rows[i].TicketNo_PNR+'</li><li><b>Full Name: </b>'+rows[i].Full_Name+'</li><li><b>Train No.: </b>'+rows[i].Train_No+'</li><li><b>Phone No.: </b>'+rows[i].Phone_No+'</li><li><b>Type of Crime: </b>'+rows[i].Type_Of_Crime+'</li><li><b>Crime Details: </b>'+rows[i].Crime_Details+'</li><li><b>Feedback: </b>'+rows[i].Feedback+'</li></p> </div></details></td></tr>';   
   }     
   });
