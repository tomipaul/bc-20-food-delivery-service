function getAllFoods(cb) {
  const req = new XMLHttpRequest();
  const uri = '/api/food/all';
  req.open('GET', uri, true);
  req.responseType = "json";
  req.send();
  req.onload = () => {
    if (req.status === 500) {
      return cb(false);
    }
    return cb(req.response);
  }
}

function uploadFoodImage(image, cb) {
  const imageRef = firebase.storage().ref().child(`images/${image.name}`);
  imageRef.put(image).then((snapshot) => {
    return cb(snapshot.downloadURL);
  }, (error) => {
    return cb(false);
  });
}

function addFood(cb) {
  const image = document.getElementById('foodImage').files[0];
  uploadFoodImage(image, (downloadURL) => {
    if (downloadURL) {
      const name = document.getElementById('name').value;
      const data = {name: name, available: true, foodImg: downloadURL};
      const req = new XMLHttpRequest();
      const uri = '/api/food/';
      req.open('POST', uri, true);
      req.setRequestHeader("Content-type", "application/json");
      req.send(JSON.stringify(data));
      req.onload = () => {
        if (req.status === 500) {
          return cb(false);
        }
        return cb(req.response);
      }
    }
    else {
      return cb(false);
    }
  });
}

function getAllOrders(cb) {
  const req = new XMLHttpRequest();
  const uri = '/api/orders/false';
  req.open('GET', uri, true);
  req.responseType = "json";
  req.send();
  req.onload = () => {
    if (req.status === 500) {
      return cb(false);
    }
    return cb(req.response);
  }
}

function displayOrders(orders) {
  console.log(orders);
  for (const orderId in orders) {
    let orderDiv = 
    displayOrder(orders[orderId]);
  }
}

function displayOrder(order) {
  let orderRow = document.createElement('tr');
  orderRow.classList.add('orderRow');
  for (let dataId in order) {
    let orderCell = document.createElement('td');
    orderCell.classList.add('orderdatacell');
    if (dataId === 'processed') {
      let processOrder = document.createElement('input');
      processOrder.type = 'checkbox';
      processOrder.id = 'processorder';
      orderCell.appendChild(processOrder);
    }
    else {
      let data = order[dataId];
      console.log(data);
      orderCell.textContent = data;
    }
    orderRow.appendChild(orderCell);
  }
  document.getElementById('orderTable').appendChild(orderRow);
}

function showPrompt(elemId) {
  let state = document.getElementById(elemId).style.display;
  if (state === "block") {
    document.getElementById(elemId).style.display = "none";
    document.getElementById(elemId).parentNode.style.display = "none";
  }
  else {
    document.getElementById(elemId).style.display = "block";
    document.getElementById(elemId).parentNode.style.display = "block";
  }
}

function deleteFood(foodId) {
  const req = new XMLHttpRequest();
  const uri = `/api/food/${foodId}`;
  req.open('DELETE', uri, true);
  req.send();
  req.onload = () => {
    if (req.status === 500) {
      return cb(false);
    }
    return cb(true);
  }
}

function displayFood(food) {
  let foodDiv = document.createElement("div");
  let foodImg = document.createElement('img');
  let foodName = document.createElement('div');
  foodName.contentEditable = true;
  let orderImg = document.createElement('img');
  foodName.textContent = food.name;
  foodDiv.id = "food";
  foodImg.src = food.foodImg;
  foodImg.id = "foodImg";
  foodDiv.appendChild(foodImg);
  foodDiv.appendChild(foodName);
  if (food.available) {
    orderImg.src = "/images/cart.png";
    orderImg.className = "orderImg";
    orderImg.foodName = food.name;
    foodDiv.appendChild(orderImg);
  }
  document.getElementById("foods").appendChild(foodDiv);
}

function displayFoods(foods) {
  for (const foodId in foods) {
    displayFood(foods[foodId]);
  }
}

function makeOrder(cb) {
  const foodName = document.getElementById("foodname").value;
  const foodQuantity = document.getElementById("foodquantity").value;
  const deliveryAddress = document.getElementById("deliveryaddress").value;
  const customerName = document.getElementById("customername").value;
  const req = new XMLHttpRequest();
  const uri = '/api/order/';
  const userEmail = firebase.auth().currentUser.email;
  req.open('POST', uri, true);
  const data = {
    foodItem: foodName,
    user: userEmail,
    quantity: foodQuantity,
    address: deliveryAddress,
    deliverTo: customerName,
    processed: 'false'
  };
  req.setRequestHeader("Content-type", "application/json");
  req.send(JSON.stringify(data));
  req.onload = () => {
    if (req.status === 201) {
      return cb(true);
    }
    return cb(false);
  }
}

function logOut() {
  firebase.auth().signOut()
  .then(() => {
    document.cookie = `token=''; expires=''; path=\/`;
  });
}

function getDisplayFoods() {
  getAllFoods((response) => {
    if (response) {
      displayFoods(response);
    }
  });
}

function getDisplayOrders() {
  getAllOrders((orders) => {
    displayOrders(orders);
  });
}

function hideDisplayElem(elemIds, elemClass=false) {
  for (const elemId of elemIds) {
    document.getElementById(elemId).style.display = 'none';
  }
  if (elemClass) {
    const elementList = document.getElementsByClassName(elemClass);
    for (let elem = 0; elem < elementList.length; elem++) {
      elementList.item(elem).style.display = 'none';
    }
  }
}

function unHideDisplayElem(elemIds, elemClass=false) {
  for (const elemId of elemIds) {
    document.getElementById(elemId).style.display = 'block';
  }
  if (elemClass) {
    const elementList = document.getElementsByClassName(elemClass);
    for (let elem = 0; elem < elementList.length; elem++) {
      elementList.item(elem).style.display = 'block';
    } 
  }
}

window.addEventListener('load', (event) => {
  event.preventDefault();
  getDisplayFoods();
  getDisplayOrders();

  document.getElementById("submitFoodInfo").addEventListener('click', (event) => {
    event.preventDefault();
    addFood((response) => {
      showPrompt("displayFoodForm");
      displayFood(JSON.parse(response));
    });
  });

  document.getElementById("foods").addEventListener('click', (event) => {
    event.preventDefault();
    if (event.target && event.target.className === "orderImg") {
      document.getElementById("foodname").value = event.target.foodName;
      document.getElementById("foodname").disabled = true;
      showPrompt("displayOrderForm");
    }
  });

  document.getElementById("submitOrdersInfo").addEventListener('click', (event) => {
    event.preventDefault();
    makeOrder((res) => {
      if (res) {
        showPrompt("displayOrderForm");
        alert("Order Successful");
      }
      else {
        alert("Oops!Something went wrong");
      }
    });
  });

  document.getElementById("cancelorder").addEventListener('click', (event) => {
    event.preventDefault();
    showPrompt("displayOrderForm");
  });

  document.getElementById("cancelfood").addEventListener('click', (event) => {
    event.preventDefault();
    showPrompt("displayFoodForm");
  });

  document.getElementById("orderclick").addEventListener('click', (event) => {
    event.preventDefault();
    hideDisplayElem(['foodsview', 'plus', 'bin']);
    unHideDisplayElem(['ordersview']);
  });

  document.getElementById("foodclick").addEventListener('click', (event) => {
    event.preventDefault();
    hideDisplayElem(['ordersview']);
    unHideDisplayElem(['foodsview', 'plus', 'bin']);
  });
});

window.addEventListener('load', (event) => {
  event.preventDefault();
  checkUserState((user) => {
    checkUserStatus(user, (isAdmin) => {
      if (isAdmin) {
        hideDisplayElem([], 'orderImg');
      }
      else {
        hideDisplayElem(['bin', 'plus', 'foodclick', 'orderclick']);
      }
    });
  });
});