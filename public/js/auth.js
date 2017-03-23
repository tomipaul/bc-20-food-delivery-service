function checkUserState() {
  firebase.auth().onAuthStateChanged((user) => {
    if (!user || !document.cookie.includes('token')) {
      location.assign('/');
    }
  });
}

window.addEventListener('load', (event) => {
  event.preventDefault();
  checkUserState();
})