var firebase = require('firebase')
var config = {
    apiKey: "AIzaSyC9YE4YBsF8Pj7mmeKoOkRMN0-Qx1xwBPo",
    authDomain: "zakupy-india.firebaseapp.com",
    databaseURL: "https://zakupy-india.firebaseio.com",
    projectId: "zakupy-india",
    storageBucket: "zakupy-india.appspot.com",
    messagingSenderId: "742186462095"
  };
  firebase.initializeApp(config);

module.exports = firebase;