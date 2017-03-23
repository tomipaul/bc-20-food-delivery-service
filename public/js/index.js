var uiConfig = {
  signInSuccessUrl: '/foods',
  signInOptions: [
    firebase.auth.GoogleAuthProvider.PROVIDER_ID,
    firebase.auth.FacebookAuthProvider.PROVIDER_ID
  ],
  // Terms of service url.
  tosUrl: '/'
};
// Initialize the FirebaseUI Widget using Firebase.
var ui = new firebaseui.auth.AuthUI(firebase.auth());
ui.start('#firebaseui-auth-container', uiConfig);

function createTokenCookie(token) {
  let newDate = new Date();
  newDate.setDate(newDate.getDate() + 30);
  document.cookie = `token=${token}; expires=${newDate}; path=\/`;
}

function signUp() {
  let email = document.getElementById('email').value;
  let password = document.getElementById('password').value;
  firebase.auth().createUserWithEmailAndPassword(email, password).then(function(user) {
    const req = new XMLHttpRequest();
    const uri = `/user/${user.uid}/false`;
    req.open('GET', uri, true);
    req.responseType = "json";
    req.send();
    req.onload = () => {
      if (req.status === 500) {
        alert("Sign-Up failure. Please try again!");
      }
      else {
        user.getToken().then((token) => {
          createTokenCookie(token);
        });
      }
    }
  });
}

function logIn() {
  let email = document.getElementById('email').value;
  let password = document.getElementById('password').value;
  firebase.auth().signInWithEmailAndPassword(email, password).then(function(user) {
    user.getToken().then((token) => {
      createTokenCookie(token);
    });
  });
}

function checkAuthState() {
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      if (document.cookie.includes('token')) {
        location.assign("/foods");
      }
      else {
        user.getToken().then((token) => {
          createTokenCookie(token);
          location.assign("/foods");
        });
      }
    }
  });
}

window.addEventListener('load', () => {
  checkAuthState();
});