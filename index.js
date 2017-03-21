const express = require('express');
const admin = require('firebase-admin');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const app = express();

const serviceAccount = require(__dirname + '/foodie.json');
const adminApp = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://foodie-aa21d.firebaseio.com"
});
const clientAuth = adminApp.auth();
const clientDb = adminApp.database();
const port = process.env.PORT || 8080;

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});

app.use(express.static(__dirname + '/public'));
app.use(cookieParser());
app.use(bodyParser.urlencoded({'extended':'true'})); //parse application/x-www-form-urlencoded
app.use(bodyParser.json()); //parse application/json

//verify token for every call to the api from client
app.use('/api', (req, res, next) => {
  clientAuth.verifyIdToken(req.cookies.token).then((decodedToken) => {
    req.uid = decodedToken.uid;
    next();
  }, (error) => {
    return res.status(401).end();
  });
});

//After authentication on the client side, send user token to this endpoint
//verify token and send back to the client as cookie.
app.post('/verify/sendcookie', (req, res) => {
  clientAuth.verifyIdToken(req.body.token).then((decodedToken) => {
    if (req.body.uid === decodedToken.uid) {
      let newDate = new Date();
      newDate.setDate(newDate.getDate() + 30);
      res.cookie('token', req.body.token, {httpOnly: true, expires: newDate});
      return res.status(201).end();
    }
    else {
      return res.status(401).end();
    }
  });
});

app.get('/', (req, res) => {
  res.send('You are signed in');
});

app.get('/index', (req, res) => {
  res.sendFile(__dirname + '/public/html/index.html');
});