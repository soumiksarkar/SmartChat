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
		var accountNo = req.body.result.parameters.Account_Number.toString();
		var amount = req.body.result.parameters.Amount.toString();
		var currency = req.body.result.parameters.Currency;
		
		var dbReq = {"Amount":amount,
					 "Currency": currency,
					 "Account Number": accountNo};
		
		console.log("database request json ::::",dbReq);
		
		db.collection("sol_details").find(dbReq).toArray(function(err, dbresult) {
			if(err){
			  console.log(err);
			  res.json(err);
			return;
		    }
			var speech = "Details are :\n";
			dbresult.forEach(function(value){
				speech = speech +" amount - "+value.Amount+",currency - "+value.Currency+",date - "+value["Date of Assignment"];
				console.log('speech::::::::', "Call database to get the response");
				res.json({"speech":speech,
				  "displayText":speech,
				  "source":"dialogflow-webhook-demo"});
				
			});
			
		});
	}
	//res.status(400).end();
	
});
module.exports = router;
