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
    response.render('pages/index');
});

//app.get('/cool', function (request, response) {
//    response.send(cool());
//});

var access_token = "Enter_Token_Here";

app.get('/sendsms', function (request, response) {
    response.render('pages/sms', {
        token: access_token
    });
});

var cb1 = function (request, response) {
    //console.log(request.body);
    var options = {
            host: "beta-sapi.telstra.com",
            path: "/v2/messages/sms",
            json: true,
            method: 'POST',
            headers: {
                'Authorization': "Bearer " + request.body.sms.token,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        },
        body = '',
        price,
        data = JSON.stringify({
            "to": request.body.sms.to,
            "body": request.body.sms.msg,
            "from": "Telstra",
            "validity": "60",
            "priority": false,
            "notifyURL": "http://my.server.net/message1/"
        });

    console.log(data);

    var req = https.request(options, function (res) {

        //console.log(res);
        console.log('STATUS: ' + res.statusCode);
        //console.log('HEADERS: ' + JSON.stringify(res.headers));

        //res.setEncoding('utf8');

        res.on('data', function (chunk) {
            body += chunk;
            //console.log('BODY: ' + chunk);
        });

        res.on('end', function (chunk) {
            price = JSON.parse(body);
            console.log('PRICE: ');
            console.log(price);
        });
    });

    req.write(data);
    req.end();

    response.send(body);
}

app.post('/sendsms', cb1);

app.get('/gettoken', function (request, response) {
    response.render('pages/gettoken');
})

var cb0 = function (request, response) {

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

    //response.send(access_token);
    //    response.render('pages/sms', {
    //    token: access_token
    //});
    //pausecomp(1000);
    response.redirect('/sendsms');
}

function pausecomp(millis)
{
    var date = new Date();
    var curDate = null;
    do { curDate = new Date(); }
    while(curDate-date < millis);
}

app.post('/gettoken', cb0);

app.listen(app.get('port'), function () {
    console.log('Node app is running on port', app.get('port'));
});
