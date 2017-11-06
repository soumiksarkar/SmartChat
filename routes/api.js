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
	var errMsg = {"speech":"error occurred",
				  "displayText": "Looks like there is some issue fetching detailed information",
				  "source":"dialogflow-webhook-demo"};
	var noRecordMsg = {"speech":"No record found",
				  "displayText": "No record found with given details. Please try again",
				  "source":"dialogflow-webhook-demo"};
				  
	var accountNo = req.body.result.parameters.AccountNo;
	var amount = req.body.result.parameters.Amount;
	var currency = req.body.result.parameters.Currency;
	var transactionDate = req.body.result.parameters.TransactionDate;
	var dateFrom = req.body.result.parameters.FromDate;
	var dateTo = req.body.result.parameters.ToDate;
	var solId = req.body.result.parameters.SolID;
	
	if(req.body.result.action === 'fund_details_amount_based'){		
		db.collection('sol_details').aggregate([
			{$match: {"Account Number": accountNo, "Currency": currency}},
			{$project: {diff: {$abs: {$subtract: [amount, '$Amount']}}, doc: '$$ROOT'}},
			{$sort: {diff: 1}},
			{$limit: 2}
		]).toArray(function(err, dbresult) {
			if(err){
			  console.log(err);
			  res.json(errMsg);
			  return;
		    }
			var speech = "Details are :";
			var isExactAmtFound = false;
			var rowCounter = 0;
			dbresult.forEach(function(value){
				if(!isExactAmtFound) {
					speech = speech + "<br> Amount - " + value.doc.Amount + ", Currency - " + value.doc.Currency + ", Date - " + value.doc["Date of Assignment"];
					console.log('speech::::::::', speech);
					res.json({"speech":speech,
					  "displayText":speech,
					  "source":"dialogflow-webhook-demo"});
				}
				if(value.diff == 0){
					isExactAmtFound = true;
				}
				rowCounter++;
			});
			if(rowCounter==0) {
				res.json(noRecordMsg);
			}
			
		});
	} else if(req.body.result.action === 'fund_details_account_based'){
		//Get All fund details based on account number
		
		var dbReq = "{";
		if(accountNo){
			dbReq = dbReq + "Account Number:" + accountNo;
		}
		dbReq = dbReq + "}";
		
		db.collection("sol_details").find(dbReq).toArray(function(err, dbresult) {
			if(err){
				console.log(err);
				res.json(errMsg);
				return;
			}
			var speech = "Details are :";
			//TODO: If no row returned, provide a message noRecordMsg
			dbresult.forEach(function(value){
				speech = speech + " Amount - " + value.Amount + ", Assignment Date - " + value["Date of Assignment"];
				console.log('speech::::::::', speech);
				res.json({"speech":speech,
				  "displayText":speech,
				  "source":"dialogflow-webhook-demo"});
				
			});
		});
		
	} else if(req.body.result.action === 'fund_details_sol_id_based'){
		//Get fund details based on SOL ID
		db.collection('sol_details').aggregate([
			{$match: {"SOL ID": solId}},
			{$project: {diff: {$abs: {$subtract: [amount, '$Amount']}}, doc: '$$ROOT'}},
			{$sort: {diff: 1}},
			{$limit: 2}
		]).toArray(function(err, dbresult) {
			if(err){
			  console.log(err);
			  res.json(errMsg);
			  return;
		    }
			var speech = "Details are :";
			var isExactAmtFound = false;
			var rowCounter = 0;
			dbresult.forEach(function(value){
				if(!isExactAmtFound) {
					speech = speech + "<br> Amount - " + value.doc.Amount + ", Currency - " + value.doc.Currency + ", Date - " + value.doc["Date of Assignment"];
					console.log('speech::::::::', speech);
					res.json({"speech":speech,
					  "displayText":speech,
					  "source":"dialogflow-webhook-demo"});
				}
				if(value.diff == 0){
					isExactAmtFound = true;
				}
				rowCounter++;
			});
			if(rowCounter==0) {
				res.json(noRecordMsg);
			}
			
		});
	} else if(req.body.result.action === 'fund_details_date_based'){
		//Get fund details based on from and to date
		//TODO: Form the query with from date and to date
		var dbReq = "{";
		if(solId){
			dbReq = dbReq + "SOL ID:" + solId + ",";
		}
		if(accountNo){
			dbReq = dbReq + "Account Number:" + accountNo + ",";
		}
		if(amount){
			dbReq = dbReq + "Amount:" + amount;
		}
		dbReq = dbReq + "}";
		
		db.collection("sol_details").find(dbReq).toArray(function(err, dbresult) {
			if(err){
				console.log(err);
				res.json(errMsg);
				return;
			}
			var speech = "Details are:";
			//TODO: check if no row returned. Search for closest amount
			//TODO: if that also does not return any info, provide a message noRecordMsg
			dbresult.forEach(function(value){
				speech = speech +"<br> Transaction Date - " + value["Date of Assignment"];
				console.log('speech::::::::', speech);
				res.json({"speech":speech,
				  "displayText":speech,
				  "source":"dialogflow-webhook-demo"});
				
			});
		});
	}
	//res.status(400).end();
	
});
module.exports = router;
