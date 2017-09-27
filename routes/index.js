var express = require('express');
var router = express.Router();
var request = require('request');


/* GET home page. */
/*
function update() {
    request.get(url, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            importedJSON = JSON.parse(body);
            console.log(importedJSON);
        }
    });
}
*/
router.get('/', function (req, res, next) {
    res.render('factory', {
        title: 'Demo Box'
    });
});
router.get('/record', function (req, res, next) {
    res.render('error', {
        title: 'Demo Box'
    });
});


module.exports = router;