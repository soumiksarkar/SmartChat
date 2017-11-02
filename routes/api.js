var express = require('express');
var router = express.Router();

/* GET users listing. */
router.post('/solDetails', function(req, res, next) {
  //res.send('respond with a resource');

  db.collection("sol_details").find(req.body).toArray(function(err, result) {
   console.log(req.body);
   console.log(err);
   if(err){
	  res.json(err);
    return;
   }
   res.json(result);
  });

});

/* details */
router.post('/getDetails', function(req, res, next){
	console.log('action from dialogflow',req.body);
	if(req.body.result.action === 'getSolDetails'){
		var accountNo = req.body.result.parameters.Account_Number;
		var amount = req.body.result.parameters.Amount;
		var currency = req.body.result.parameters.Currency;
		
		var dbReq = {"Amount":200};
		
		console.log("database request json ::::",dbReq);
		
		db.collection("sol_details").find(dbReq).toArray(function(err, result) {
			if(err){
			  console.log(err);
			  res.json(err);
			return;
		    }
			var speech = "Details are : amount -";
			res.json({"speech":"Call database to get the response",
			  "displayText":"Call database to get the response",
			  "source":"dialogflow-webhook-demo"});
		    console.log('result::::::::', result);
		});
	}
	//res.status(400).end();
	
});
module.exports = router;
