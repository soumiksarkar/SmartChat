var fs = require('fs');
var http = require('http');
var express = require('express');
var path = require('path');
var app = express();
var SockJS  = require('sockjs');
var api = require('./routes/api');
var bodyParser = require('body-parser');
var dataFile = './data.txt';
var datas = [];
var lastDatas = '[]';


// Set static dir
app.use('/assets', express.static('bower_components'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));
// Check if data file exists, if not exists then create the file
if(!fs.existsSync(dataFile)) {
    fs.writeFileSync(dataFile, '[]');
} else {
    lastDatas = fs.readFileSync(dataFile, 'utf8');
    datas = JSON.parse(lastDatas);
}

// Watch the datas array, on change, save to db
setInterval(function(){
    if(JSON.stringify(datas) !== lastDatas) {
        var stringified = JSON.stringify(datas);
        fs.writeFile(dataFile, stringified, function(err){
            if(err) throw err;
            console.log(dataFile + ' updated');
            lastDatas = stringified;
        });
    }
}, 300);


// When the user goes to the / route, send view
/*app.get('/', function(req, res) {
    res.sendFile(__dirname + '/views/login.html');
});

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/views/index.html');
});*/

app.get('/', function(req, res) {
	if(req.query.publicKey)
	publicKey = req.query.publicKey;
	else
	publicKey = '';

	if(publicKey)
     res.sendFile(__dirname + '/views/index.html');
	else
     res.status(500).end("Invalid key");
});

app.use('/api/v1', api);
// Setup SockJS server
var sockjs = SockJS.createServer({sockjs_url: "http://cdn.jsdelivr.net/sockjs/0.3.4/sockjs.min.js"});
var clients = [];
var agentKey = [];
sockjs.on('connection', function(conn) {
    agentKey[conn] = publicKey;
    // add connection to clients array
    clients.push(conn);
    console.log('connection opened', clients.length);

    // send all data to the client
    /*datas.forEach(function(data){
        conn.write(JSON.stringify(data));
    });*/

    conn.on('close', function(){
        // remove the connection from the clients array
        clients.splice(clients.indexOf(conn), 1);
        console.log('connection closed', clients.length);
    });

    conn.on('data', function(data){
        data = JSON.parse(data);
        var newMessage = {
            message: data.message,
            username: data.username,
            timestamp: Date.now()
        };
        var writableData = {};
		writableData["connId"] = conn.id;
		writableData["data"] = newMessage;
        // append new data on datas array
        datas.push(writableData);

        // send new data to all clients
        //clients.forEach(function(conn){
            conn.write(JSON.stringify(newMessage));
			const apiaiApp = require('apiai')(agentKey[conn]);

			  let sender = conn.id;
			  let text = data.message;
			 console.log("sender = " + sender);
			 console.log("text = " + text);
			  let apiai = apiaiApp.textRequest(text, {
				sessionId: conn.id // use any arbitrary id
			  });

			  apiai.on('response', (response) => {

				console.log("response = " + response);
			  let aiText = response.result.fulfillment.speech;
              console.log(aiText.toString());
				var newMessage = {
					message: aiText,
					username: 'PwC',
					timestamp: Date.now()
				};
                var writableData = {};
				writableData["connId"] = conn.id;
				writableData["data"] = newMessage;
				datas.push(writableData);
              //datas.push(newMessage);
              conn.write(JSON.stringify(newMessage));

			  });

			  apiai.on('error', (error) => {
				console.log('error::::::::::::::::::::::',error);
				var parseJson = JSON.parse(error.responseBody);
				console.log(parseJson);
				var errMsg = {
					message: parseJson.status.errorDetails,
					username: 'PwC',
					timestamp: Date.now()
				};
				conn.write(JSON.stringify(errMsg));
			  });

			  apiai.end();

        //});
    });
});

// Create the NodeJS HTTP Server with express app
var server = http.createServer(app);

// Install sockjs handlers on http server
sockjs.installHandlers(server, {prefix:'/messages'});

// Start the server
//server.listen(process.env.PORT || 3000, function(){
    //console.log('Express serving on port 3000');
//});

var mongoClient = require('mongodb');

// Initialize connection once
mongoClient.connect("mongodb://pwcchatbot:pwcchatbot@cluster0-shard-00-00-oelig.mongodb.net:27017,cluster0-shard-00-01-oelig.mongodb.net:27017,cluster0-shard-00-02-oelig.mongodb.net:27017/chatbot?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin", function(err, database) {
  if(err) throw err;

  db = database;
  console.log(db);
   // Start the application after the database connection is ready
   // Start the server
	server.listen(process.env.PORT || 3000, function(){
		console.log('Express serving on port 3000');
	});
  //var cornService  = require('./config/cronConfig');
});
