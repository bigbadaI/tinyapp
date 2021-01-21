// const express_server = require('./express_server');


const usersDatabase = {
  "randonUserID": {
    id: "randomUserID",
    email: "randomUser@gmail.uk",
    password: "$2b$05$pULVmgcx5coHNBqVZn0TDe57gFp19td8c4bIi1WMitxIr5eeKgLIW"
  }
};

const urlDatabase = {
  b2xVn2: {longURL: "http://www.lighthouselabs.ca", userID: "randomUserID" },
  "9sm5xK": {longURL: "http://www.google.com", userID: "randomUserID" }
};

const generateRandomString = function() {
  return Math.random().toString(36).substr(6);
};

const doesEmailAlreadyExist = function(email, database) {
  let emailArray = Object.keys(database);
  for (let i = 0; i < emailArray.length; i++) {
    if (usersDatabase[emailArray[i]].email === email) {
      return emailArray[i];
    }
  }
  return false;
};

const urlsForUser = function(id) {
  let tempObj = {};
  let keyArray = Object.keys(urlDatabase);
  for (let i = 0; i < keyArray.length; i++) {
    if (urlDatabase[keyArray[i]].userID === id) {
      tempObj[keyArray[i]] = { longURL: urlDatabase[keyArray[i]].longURL};
    }
  }
  return tempObj;
};

const isUserSignedIn = function(req) {
  const templateVars = {user: usersDatabase[req.session.username]};
  if (templateVars.user) {
    return true;
  } else {
    return false;
  }
};

module.exports = {
  isUserSignedIn,
  generateRandomString,
  urlsForUser,
  doesEmailAlreadyExist,
  urlDatabase,
  usersDatabase
};