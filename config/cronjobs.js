var express = require('express');
var mongo = require('mongodb');
exports.first_job = {

    after: {                // Configuring this job to run after this period.
        seconds: 2,
        minutes:0,
        hours: 0,
        days: 0
    },
    job: function () {
    //console.log("first_job");
		//JOB BODY Implemented Here

    //var url = "mongodb://" + appConstant.dbUrl + "/" + appConstant.dbSchema;
    var url = "mongodb://pwcchatbot:pwcchatbot@cluster0-shard-00-02-oelig.mongodb.net:27017/test?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin"
    var resultArray  = [];
    //console.log('mongo' , mongo);
    mongo.connect(url, function (err, db) {
        //assert.equal(null, err);
        if (err) {
          console.log("Database error in connection >>>>>>>" , err);
        }
        //console.log("Database Connection Established >>>>>>>");

        var cursor = db.collection('sol_details').find();
        console.log('cursor' , cursor);
        cursor.forEach(function (doc, err) {
            if (err) {
            console.log('err' , err);
            }
            console.log(doc);
            resultArray.push(doc);

        }, function () {
            db.close();

        });
    });

    },
    spawn: true
}

exports.second_job = {

    on: "*/2 * * * * *",    // Cron tab instruction.
    job: function () {
        console.log("second_job");
		//JOB BODY Implemented Here
    },
    spawn: false            // If false, the job will not run in a separate process.
}
