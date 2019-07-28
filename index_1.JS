var express = require('express');
//var socket = require('socket.io');
var mysql = require('mysql');
var stringify = require('json-stringify');
// App setup
var app = express();
var server = app.listen(4000, function(){
    console.log('listening for requests on port 4000,');
});
var distance = require('google-distance');
 var obj = '26.5914509,76.9237484';
var myJSON = JSON.stringify(obj);
 distance.get(
  {
    origin: [obj],
    destination: 'KARAULI ,ind',
  mode: 'bus'
  },
  function(err, data) {
    if (err) return console.log(err);
    console.log(data);
});
