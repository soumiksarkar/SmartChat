/*Todo :: Start Cron Job Process */

var cronjob = require('node-cron-job');

console.log("Cron job configured :::::::::::::::::::::::::::::::::::::::: " ,__dirname);
cronjob.setJobsPath(__dirname + '/cronjobs');// Absolute path to the jobs module.
cronjob.startJob('first_job');
//cronjob.startJob('second_job');
