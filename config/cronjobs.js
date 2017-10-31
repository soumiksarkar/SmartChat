var express = require('express');
var mongo = require('mongodb');
var rp = require('request-promise');
exports.first_job = {
    after: {
        seconds:0,
        minutes:1,
        hours: 0,
        days: 0
    },
    job: function () {
    var url = "mongodb://pwcchatbot:pwcchatbot@cluster0-shard-00-02-oelig.mongodb.net:27017/chatbot?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin"
    var resultArray  = [];
    mongo.connect(url, function (err, db) {
        if (err) {
          console.log("Database error in connection >>>>>>>" , err);
        }
        var options = {
              uri: 'https://api.dialogflow.com/v1/intents?v=20150910',
                headers: {
                  'Authorization': 'Bearer 5753425ffa1c4f0c99d9a87b064a4fc0'
                },
                json: true // Automatically parses the JSON string in the response
        };
        rp(options)
          .then(function (repos) {
              console.log('User has %d repos', repos.length);
              db.collection("intent_dialogflow").insertMany(repos, function(err, res) {
              if (err){
                throw err;
              }
              console.log('insert successful');
              db.close();
            });
        })
        .catch(function (err) {
        // API call failed...
        });

        //var cursor = db.collection('sol_details').find();
        //console.log('cursor' , cursor);
        /*cursor.forEach(function (doc, err) {
            if (err) {
            console.log('err' , err);
            }
            console.log('doc' ,doc);
            resultArray.push(doc);

        }, function () {
            db.close();

        });*/
    });

    },
    spawn: true
}

exports.second_job = {

    on: "*/2 * * * * *",    // Cron tab instruction.
    job: function () {
        console.log("second_job");
    },
    spawn: false            // If false, the job will not run in a separate process.
}
