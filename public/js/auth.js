function checkUserState(cb) {
  firebase.auth().onAuthStateChanged((user) => {
    if (!user || !document.cookie.includes('token')) {
      location.assign('/');
    }
    else {
      return cb(user);
    }
  });
}

function checkUserStatus(user, cb) {
  const req = new XMLHttpRequest();
  const uri = `/user/${user.uid}`;
  req.open('GET', uri, true);
  req.responseType = "json";
  req.send();
  req.onload = () => {
    console.log(req.response);
    return cb(req.response);
      /*const elementList = document.getElementsByClassName("if-admin");
      for (let elem = 0; elem < elementList.length; elem++) {
        elementList.item(elem).classList.remove("hide-elem");
      }*/
  }
}