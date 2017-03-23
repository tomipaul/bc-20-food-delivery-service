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
    orderImg.id = "orderImg";
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
    processed: false
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

document.addEventListener('DOMContentLoaded', (event) => {
  event.preventDefault();
  getAllFoods((response) => {
    if (response) {
      displayFoods(response);
    }
  });

  document.getElementById("submitFoodInfo").addEventListener('click', (event) => {
    event.preventDefault();
    addFood((response) => {
      showPrompt("displayFoodForm");
      displayFood(JSON.parse(response));
    });
  });

  document.getElementById("foods").addEventListener('click', (event) => {
    event.preventDefault();
    if (event.target && event.target.id === "orderImg") {
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

  window.addEventListener('load', (event)=>{
    event.preventDefault();
    const uid = firebase.auth().currentUser.uid;
    const req = new XMLHttpRequest();
    const uri = `/user/${uid}/false`;
    req.open('GET', uri, true);
    req.responseType = "json";
    req.send();
    req.onload = () => {
      if (!req.response) {
        alert("Error checking user status. Please try again!");
      }
      else {
        document.getElementsByClassName("hide-elem").forEach((elem) => {
          elem.classList.remove("hide-elem");
        });
      }
    }
  });
});