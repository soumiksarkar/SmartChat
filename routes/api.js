var express = require('express');
var router = express.Router();
var dateFormat = require('dateformat');

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
	var errMsg = {"speech":"Looks like there is some issue fetching detailed information",
				  "displayText": "Looks like there is some issue fetching detailed information",
				  "source":"dialogflow-webhook-demo"};
				  
	var accountNo = parseInt(req.body.result.parameters.AccountNo);
	var amount = parseFloat(req.body.result.parameters.Amount);
	var currency = req.body.result.parameters.Currency;
	var transactionDate = req.body.result.parameters.TransactionDate;
	var dateFrom = req.body.result.parameters.FromDate;
	var dateTo = req.body.result.parameters.ToDate;
	var solId = parseInt(req.body.result.parameters.SolID);
	
	if(req.body.result.action === 'fund_details_amount_based'){
		
		console.log("inside fund_details_amount_based");
		console.log("accNo:::", accountNo);
		console.log("currency:::", currency);
		
		db.collection('sol_details').find({"Account Number": accountNo}).toArray(function(err, response) {
		   if(response.length){
				db.collection('sol_details').aggregate([
				{$match: {"Account Number": accountNo, "Currency": currency}},
				{$project: {diff: {$abs: {$subtract: [amount, '$Amount']}}, doc: '$$ROOT'}},
				{$sort: {diff: 1}},
				{$limit: 3}
				]).toArray(function(err, dbresult) {
					if(err){
					  console.log(err);
					  res.json(errMsg);
					  return;
					}
					console.log("dbResult",dbresult);
					var speechHeader = "The amounts closest to this figure were assigned to your SOL as below";
					var speech = "";
					var isExactAmtFound = false;
					var rowCounter = 0;
					var allowedDiff = amount * 0.1;
					if(allowedDiff<100) {
						allowedDiff = 100;
					}
					isRowFound = false;
					dbresult.forEach(function(value){
						if(value.diff == 0) {
							rowCounter++;
							isExactAmtFound = true;
							speech = "The amount assigned to your SOL on " + dateFormat(value.doc["Date of Assignment"],"dd-mmm-yy");
						} else if(!isExactAmtFound && value.diff < allowedDiff) {
							rowCounter++;
							speech = speech + "<br>" +  value.doc.Amount + " assigned to your SOL on " + dateFormat(value.doc["Date of Assignment"],"dd-mmm-yy");
						} else if(!isExactAmtFound && value.diff > allowedDiff && rowCounter==0){
							speech = "No transaction found with the amount you provided";
							console.log("Condition satisfied");
						}
						console.log("speech:::",speech);
						
						if(!isExactAmtFound && rowCounter>0) {
							res.json({"speech":speechHeader + speech,
								  "displayText":speechHeader + speech,
								  "source":"dialogflow-webhook-demo"});
						} else {
							res.json({"speech":speech,
								  "displayText":speech,
								  "source":"dialogflow-webhook-demo"});
						}
						isRowFound = true;
					});
					if(!isRowFound) {
						res.json({"speech":"No details found with the information you provided",
								  "displayText":"No details found with the information you provided",
								  "source":"dialogflow-webhook-demo"});
					}
				});
		   } else {
				res.json({"speech":"Provided account number is not valid",
						  "displayText":"Provided account number is not valid",
						  "source":"dialogflow-webhook-demo"});
		   }
		});
		
		
	} else if(req.body.result.action === 'fund_details_sol_id_based'){
		//Get fund details based on SOL ID
		console.log("inside fund_details_sol_id_based");
		console.log("solId:::", solId);
		console.log("accNo:::", accountNo);
		console.log("currency:::", currency);
		
		db.collection('sol_details').find({"SOL ID" : solId}).toArray(function(err, response) {
			if(response.length){
				db.collection('sol_details').aggregate([
					{$match: {"SOL ID": solId}},
					{$project: {diff: {$abs: {$subtract: [amount, '$Amount']}}, doc: '$$ROOT'}},
					{$sort: {diff: 1}},
					{$limit: 3}
				]).toArray(function(err, dbresult) {
					if(err){
					  console.log(err);
					  res.json(errMsg);
					  return;
					}
					console.log("dbResult:::",dbresult);
					var speechHeader = "The amounts closest to this figure were assigned to your branch as below:<br>";
					var speech = "";
					var isExactAmtFound = false;
					var rowCounter = 0;
					var allowedDiff = amount * 0.1;
					if(allowedDiff<100) {
						allowedDiff = 100;
					}
					isRowFound = false;
					dbresult.forEach(function(value){
						if(value.diff == 0) {
							rowCounter++;
							isExactAmtFound = true;
							speech = "The amount assigned to your SOL on " + dateFormat(value.doc["Date of Assignment"],"dd-mmm-yy");
						} else if(!isExactAmtFound && value.diff < allowedDiff) {
							rowCounter++;
							speech = speech + "<br>" +  value.doc.Amount + " assigned to your branch on " + dateFormat(value.doc["Date of Assignment"],"dd-mmm-yy");
						} else if(!isExactAmtFound && value.diff > allowedDiff && rowCounter==0){
							speech = "No transaction found with the amount you provided";
						}
						console.log("speech:::",speech);
						
						if(!isExactAmtFound && rowCounter>0) {
							res.json({"speech":speechHeader + speech,
								  "displayText":speechHeader + speech,
								  "source":"dialogflow-webhook-demo"});
						} else {
							res.json({"speech":speech,
								  "displayText":speech,
								  "source":"dialogflow-webhook-demo"});
						}
						isRowFound = true;
					});
					if(!isRowFound) {
						res.json({"speech":"No details found with the information you provided",
								  "displayText":"No details found with the information you provided",
								  "source":"dialogflow-webhook-demo"});
					}
				});
			} else {
				res.json({"speech":"Provided SOL ID is not valid",
						  "displayText":"Provided SOL ID is not valid",
						  "source":"dialogflow-webhook-demo"});
			}
		});
	} else if(req.body.result.action === 'total_fund_sol_id'){
		
		console.log("inside total_fund_sol_id");
		console.log("solId:::", solId);
		console.log("test log");
		
		db.collection('sol_details').find({"SOL ID": solId}).toArray(function(err, response) {
		   if(response.length){
				if(err){
				  console.log(err);
				  res.json(errMsg);
				  return;
				}
				console.log("dbResult",response);
				var speechHeader = "The total funds in your SOL ID is as follows :-<br>";
				var speech = "";
				response.forEach(function(value){
					speech = speech + "<br>" +  value.Amount + " " + value.Currency;
				});
				res.json({"speech":speechHeader + speech,
						  "displayText":speechHeader + speech,
						  "source":"dialogflow-webhook-demo"});
		   } else {
				res.json({"speech":"Provided sol id is not valid",
						  "displayText":"Provided sol id is not valid",
						  "source":"dialogflow-webhook-demo"});
		   }
		});
		
		
	}
		
		
	//res.status(400).end();
	
});


module.exports = router;
