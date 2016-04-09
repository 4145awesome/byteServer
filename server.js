// server.js

// BASE SETUP
// =============================================================================

// call the packages we need
var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');
var crypto = require('crypto');
var fs = require('fs');

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 80;        // set our port

Buffer.prototype.toByteArray = function () {
    return Array.prototype.slice.call(this, 0)
}

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
    res.json({ message: '4145Awesome A6 Server ' });
});

router.post('/process', function(req, res){
    var startTime = Date.now();
    var token = req.get("token");

    const hash = crypto.createHash('sha256');
    hash.update('4145Awesome' + req.body["time"]);
    var digest = hash.digest('hex');

    //validate token
    if(token != digest){
        res.sendStatus(401);
    }

    //validate message parameters
    if(req.body["id"] < 0 || req.body["size"] < 10 || req.body["size"] > 100000){
        res.sendStatus(400);
    }

    fs.open('image.jpg', 'r', function(status, fd){
       if(status){
           res.sendStatus(500);
           return;
       }

        var size = req.body["size"];
        var buffer = new Buffer(size);
        fs.read(fd, buffer, 0, size, 0, function(err, num, buffer){
            res.json({"id": req.body["id"], "received": startTime, "payload": buffer.toByteArray(), "delay": Date.now() - startTime});
        })
    });

});

// more routes for our API will happen here

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Server ready on port ' + port);