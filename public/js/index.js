const uiConfig = {
  signInSuccess: (currentUser) => {
    currentUser.getToken().then((token) => {
      const req = new XMLHttpRequest();
      const uri = '/verify/sendcookie';
      req.open('POST', uri, true);
      req.setRequestHeader("Content-type", "application/json");
      req.send(JSON.stringify({uid: user.uid, token: token}));
      req.onload = () => {
        return true;
      }
    });
  },
  signInSuccessUrl: '/',
  signInOptions: [
    firebase.auth.GoogleAuthProvider.PROVIDER_ID,
    firebase.auth.FacebookAuthProvider.PROVIDER_ID,
    firebase.auth.EmailAuthProvider.PROVIDER_ID
  ],
  // Terms of service url.
  tosUrl: '/'
};
// Initialize the FirebaseUI Widget using Firebase.
const ui = new firebaseui.auth.AuthUI(firebase.auth());
ui.start('#firebaseui-auth-container', uiConfig);