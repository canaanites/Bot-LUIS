//
// Hack13
//
//
var http = require('http');
var path = require('path');

var async = require('async');
var socketio = require('socket.io');
var express = require('express');

var jsonfile = require('jsonfile');
var database = '/database.json';


var geolib = require("geolib");
var busRoute = {A: 1, B: 2};

var app = express();
var server = require('http').Server(app);
var io = socketio(server);

var port = process.env.PORT || 3000;
server.listen(port, function(){
    console.log('server started on port: 3000');
});

app.use("/", express.static(__dirname + '/'));
app.get('/', function(req, res){
    res.sendfile(__dirname + '/index.html');
});

io.on('connection', function (socket) {
    messages.forEach(function (data) {
      socket.emit('busRoute', busRoute);
    });

    socket.on('disconnect', function () {

    });

    socket.on('addUserInput', function (data) {
        writeToDb(data);
    });

    
    
    //setInt for every 2min update 
    socket.on('getBusCoords', function(msg) {
        getCoordsFromDb();
        io.sockets.emit('updateBusRoute', baseStartingLocation);
    })

  });


var baseStartingLocation = {latitude: 41.892955, longitude: -87.631493};
var getCoordsFromDb = () => {
      var coordArray = [];
      jsonfile.readFile('./database.json', function (err, obj) {
        if (err) {
            console.log(err);
        } else {
            try {
                for(i in obj){
                    var checkIfNearBy = geolib.isPointInCircle(
                        obj[i],
                        baseStartingLocation, //base location to start from
                        500 //500 meters
                    );
                    if(checkIfNearBy){
                      coordArray.push(obj[i])
                    }
                }
               console.log("New center location", geolib.getCenter(coordArray));
               return baseStartingLocation = geolib.getCenter(coordArray);
            }catch (e){
                console.log(e);
            }
        }
    });
}

var writeToDb = (obj) => {
   jsonfile.readFile('./database.json', function (err, dbObj) {
      var newDbObj = dbObj; newDbObj.push(obj);
      jsonfile.writeFile('./database.json', newDbObj, function (err) {
        //console.error(err)
      });
    });
}


//writeToDb({latitude: 41.888557, longitude: -87.635450});
getCoordsFromDb();

