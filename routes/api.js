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


module.exports = router;
