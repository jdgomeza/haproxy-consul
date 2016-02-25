// From Express examples/cookies
// var express = require('../../');
var express = require('express');
var app = module.exports = express();
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

// custom log format
if ('test' != process.env.NODE_ENV) app.use(logger('combined'));

var keyStore = {};

// parses request cookies, populating
// req.cookies and req.signedCookies
// when the secret is passed, used
// for signing the cookies.
app.use(cookieParser('my secret here'));

// parses x-www-form-urlencoded
//app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', function(req, res){
  if (req.cookies.remember) {
    console.log("Req params --- ", req.params, " - ", req.query);
    if( req.query.key){
      if( keyStore[req.query.key] ){
        res.send(keyStore[req.query.key]);
      }else{
        res.status(404).send("Not found");
      }
    }else{
      res.status(400).send("Need key");
    }
  } else {
    res.send('No cookie - server ' + require('os').hostname());
  }
});

app.get('/forget', function(req, res){
  res.clearCookie('remember');
  res.redirect('back');
  keyStore = {};
});

app.post('/', function(req, res){
  var minute = 60000;
  console.log('Body: ',req.body);

  if (req.body.remember){
    keyStore[req.body.key]=req.body.value;
    console.log("Keys - ", keyStore);
    res.cookie('remember', 1, { maxAge: minute });
    res.send("Saved " + keyStore[req.body.key]);
  }else{
    res.redirect('back');
  }


});

/* istanbul ignore next */
if (!module.parent) {
  app.listen(3000);
  console.log('Express started on port 3000');
}
