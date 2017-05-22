var cool = require('cool-ascii-faces');
var express = require('express');
var bodyParser = require('body-parser');
var https = require('https');

var app = express();
app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({ // to support URL-encoded bodies
    extended: true
}));

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function (request, response) {
    response.render('pages/index')
});

app.get('/cool', function (request, response) {
    response.send(cool());
});

//app.get('/sms', function (request, response) {
//    response.render('pages/sms');
//});

app.get('/gettoken', function (request, response) {
    response.render('pages/gettoken');
})

var access_token = "";

var cb = function (request, response) {
    var pathUrl = "/v1/oauth/token?client_id=" + request.body.client.id + "&client_secret=" + request.body.client.secret + "&grant_type=client_credentials&scope=NSMS";

    var options = {
        host: "beta-sapi.telstra.com",
        path: "/v1/oauth/token?client_id=" + request.body.client.id + "&client_secret=" + request.body.client.secret + "&grant_type=client_credentials&scope=NSMS",
        method: 'GET'
    };

    //console.log(options);

    https.request(options, function (res) {
        var body = '';

        //console.log(res);
        console.log('STATUS: ' + res.statusCode);
        //console.log('HEADERS: ' + JSON.stringify(res.headers));

        //res.setEncoding('utf8');

        res.on('data', function (chunk) {
            body += chunk;
            //console.log('BODY: ' + chunk);
        });

        res.on('end', function () {
            var price = JSON.parse(body);
            access_token = price.access_token;
            console.log(access_token);
        })
    }).end();

    response.send(access_token);
}

app.post('/gettoken', cb);

app.listen(app.get('port'), function () {
    console.log('Node app is running on port', app.get('port'));
});
