var express = require('express');
var bodyParser = require('body-parser');
var https = require('https');
var OAuth = require('oauth');
var request = require('request');

var app = express();
app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({ // to support URL-encoded bodies
    extended: true
}));

process.env.NODE_TLS_REJECTED_UNAUTHORIZED = "0";

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function (request, response) {
    response.render('pages/index');
});

var access_token = "Enter_Token_Here";
var globalMessageId = '';

app.get('/getMessageStatus/:id', function (request, response) {
    console.log(request.params);
    console.log(request.params.id);

    var options = {
        host: "slot2.apipractice.t-dev.telstra.net",
        path: "/v2/messages/sms/" + request.params.id,
        method: 'POST',
        headers: {
            'Authorization': "Bearer " + access_token,
            'Accept': 'application/json'
        }
    };
    console.log(options);

    var body = '';

    var req = https.request(options, function (res) {
        console.log('STATUS: ' + res.statusCode);
        res.on('data', function (chunk) {
            body += chunk;
            console.log('BODY: ' + chunk);

        });

        res.on('end', function (chunk) {
            price = JSON.parse(body);
            console.log(price);
            response.send(body);
        });
    });

});

app.get('/sendsms', function (request, response) {
    response.render('pages/sms', {
        token: access_token
    });
});

var cb1 = function (request, response) {
    var options = {
            host: "slot2.apipractice.t-dev.telstra.net",
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
        price, data;

    if (request.body.sms.from) {
        data = JSON.stringify({
            "to": request.body.sms.to,
            "body": request.body.sms.msg,
            "from": request.body.sms.from,
            "validity": "60",
            "priority": false,
            "notifyURL": "http://my.server.net/message1/"
        });
    } else {
        data = JSON.stringify({
            "to": request.body.sms.to,
            "body": request.body.sms.msg,
            "from": "Telstra",
            "validity": "60",
            "priority": false,
            "notifyURL": "http://my.server.net/message1/"
        });
    }
    console.log(data);

    var req = https.request(options, function (res) {
        console.log('STATUS: ' + res.statusCode);
        res.on('data', function (chunk) {
            body += chunk;
            //console.log('BODY: ' + chunk);
        });

        res.on('end', function (chunk) {
            price = JSON.parse(body);
            console.log(price);
            var messageArray = price[0].messageId.split("/");
            globalMessageId = messageArray[messageArray.length - 1];
            var messageId = "getMessageStatus/" + messageArray[messageArray.length - 1];
            console.log("MessageStatus: " + price[0].deliveryStatus);
            console.log("Message ID: " + messageId);
            response.render('pages/data', {
                deliveryStatus: price[0].deliveryStatus,
                messageId: messageId
            });
        });
    });

    req.write(data);
    req.end();
}

app.post('/sendsms', cb1);

app.get('/gettoken', function (request, response) {
    response.render('pages/gettoken');
})

var cb0 = function (request, response) {

    var options = {
        host: "slot2.apipractice.t-dev.telstra.net",
        path: "/v1/oauth/token?client_id=" + request.body.client.id + "&client_secret=" + request.body.client.secret + "&grant_type=client_credentials&scope=NSMS",
        method: 'GET'
    };

    https.request(options, function (res) {
        var body = '';

        console.log('STATUS: ' + res.statusCode);
        res.on('data', function (chunk) {
            body += chunk;
            //console.log('BODY: ' + chunk);
        });

        res.on('end', function () {
            var price = JSON.parse(body);
            access_token = price.access_token;
            console.log(access_token);
        })
        response.redirect('/sendsms');

    }).end();

    //response.redirect('/sendsms');
}

app.post('/gettoken', cb0);

app.listen(app.get('port'), function () {
    console.log('Node app is running on port', app.get('port'));
});
