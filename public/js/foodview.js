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
        displayAddFood()
        return cb(req.response);
      }
    }
    else {
      return cb(false);
    }
  });
}

function displayAddFood() {
  let state = document.getElementById("displayFormBg").style.display;
  if (state === "block") {
    document.getElementById("displayFormBg").style.display = "none";
  }
  else {
    document.getElementById("displayFormBg").style.display = "block";
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
  let orderImg = document.createElement('img');
  foodName.textContent = food.name;
  foodDiv.id = "food";
  foodImg.src = food.foodImg;
  foodImg.id = "foodImg";
  foodDiv.appendChild(foodImg);
  foodDiv.appendChild(foodName);
  if (food.available) {
    orderImg.src = "images/cart.png";
    orderImg.id = "orderImg";
    orderImg.foodName = food.name;
    foodDiv.appendChild(orderImg);
  }
  document.getElementById("foods").appendChild(foodDiv);
}

function displayFoods(foods) {
  const foods = JSON.parse(foods);
  for (const foodId in foods) {
    displayFood(foods[foodId]);
  }
}

document.addEventListener('DOMContentLoaded', (event) => {
      console.log('response');

  event.preventDefault();
  getAllFoods((respons) => {
    console.log(respons);
    // if (response) {
    //   console.log(response);
    //   displayFoods(response);
    // }
  });
});