const express = require('express');
const admin = require('firebase-admin');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const app = express();

const serviceAccount = require('./foodie.json');
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
//serves static files
app.use(express.static(__dirname + '/public'));
//parse cookies sent from client
app.use(cookieParser());
//parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({'extended':'true'})); 
//parse application/json
app.use(bodyParser.json()); 
//verify token for every call to the api from client
app.use('/api', (req, res, next) => {
  // console.log(req.cookies.token);
  clientAuth.verifyIdToken(req.cookies.token).then((decodedToken) => {
    req.uid = decodedToken.uid;
    next();
  }, (error) => {
    res.clearCookie('token', {path: '/'});
    return res.redirect('/');
  });
});

//add a food item
app.post('/api/food', (req, res) => {
  clientDb.ref("foodItems").push(req.body).then(() => {
    return res.status(201).json(req.body);
  }, (error) => {
    return res.status(500).send(error);
  });
});

//modify a food item property
app.put('/api/food/:foodId', (req, res) => {
  clientDb.ref(`foodItems/${req.params.foodId}`).update(req.body)
  .then(() => {
    return res.status(200).end();
  }, (error) => {
    return res.status(500).send(error);
  });
});

//delete a food item
app.delete('/api/food/:foodId', (req, res) => {
  clientDb.ref(`foodItems/${req.params.foodId}`).remove()
  .then(() => {
    return res.status(204).end();
  }, (error) => {
    return res.status(500).send(error);
  });
});

//get all food items
app.get('/api/food/all', (req, res) => {
  clientDb.ref('foodItems').once('value')
  .then((snapshot) => {
    return res.status(200).json(snapshot.val());
  }, (error) => {
    return res.status(500).send(error);
  });
});

//create a new order
app.post('/api/order', (req, res) => {
  clientDb.ref('orders').push(req.body).then(() => {
    return res.status(201).json(req.body);
  }, (error) => {
    return res.status(500).send(error);
  });
});

//edit an order
app.put('/api/order/:orderId', (req, res) => {
  clientDb.ref(`orders/${req.params.orderId}`).update(req.body)
  .then(() => {
    return res.status(200).end();
  }, (error) => {
    return res.status(500).send(error);
  });
});

//delete an order
app.delete('/api/order/:orderId', (req, res) => {
  clientDb.ref(`orders/${req.params.orderId}`).remove()
  .then(() => {
    return res.status(204).end();
  }, (error) => {
    return res.status(500).send(error);
  });
});

//get all pending or processed orders
app.get('/api/orders/:processed', (req, res) => {
  clientDb.ref('orders').orderByChild('status').equalTo(req.params.processed).once('value')
  .then((snapshot) => {
    return res.status(200).json(snapshot.val());
  }, (error) => {
    return res.status(500).send(error);
  });
});

app.get('/user/:userid/:admin', (req, res) => {
  clientDb.ref(`users/${req.params.userid}`).set(req.params.admin, (error) => {
    if (error) {
      return res.status(500).send(error);
    }
    else {
      return res.status(200).end();
    }
  });
});

app.get('/user/:userid', (req, res) => {
  clientDb.ref(`users/${req.params.userid}`).once("value")
  .then((snapshot) => {
    if (snapshot.val()) {
      return res.status(200).json(snapshot.val());
    }
    else {
      return res.status(500).json(snapshot.val())
    }
  });
});

app.get('/foods', (req, res) => {
  res.sendFile(__dirname + '/public/html/foodview.html');
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/html/index.html');
});