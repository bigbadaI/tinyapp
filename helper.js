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
  tsm5xK: {longURL: "http://www.google.com", userID: "randomUserID" }
};

const generateRandomString = function() {
  return Math.random().toString(36).substr(6);
};

const doesEmailAlreadyExist = function(email, database) {
  let emailArray = Object.keys(database);
  for (let i = 0; i < emailArray.length; i++) {
    if (database[emailArray[i]].email === email) {
      return emailArray[i];
    }
  }
  return undefined;
};

const urlsForUser = function(id, object) {
  let tempObj = {};
  let keyArray = Object.keys(object);
  for (let i = 0; i < keyArray.length; i++) {
    if (object[keyArray[i]].userID === id) {
      tempObj[keyArray[i]] = { longURL: object[keyArray[i]].longURL, userID : object[keyArray[i]].userID};
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