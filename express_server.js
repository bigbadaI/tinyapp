const express = require("express");
const app = express();
const PORT = 8080; //default port 8080
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

//functions for use in different get and post calls
const generateRandomString = function() {
  return Math.random().toString(36).substr(6);
};

const doesEmailAlreadyExist = function(registerEmail) {
  let emailArray = Object.keys(usersDatabase);
  for (let i = 0; i < emailArray.length; i++) {
    if (usersDatabase[emailArray[i]].email === registerEmail) {
      return emailArray[i];
    }
  }
  return false;
};

const urlsForUser = function(id) {
  let tempObj = {};
  let tempId = id;
  let keyArray = Object.keys(urlDatabase);
  for (let i = 0; i < keyArray.length; i++) {
    if (urlDatabase[keyArray[i]].userID === tempId) {
      tempObj[keyArray[i]] = { longURL: urlDatabase[keyArray[i]].longURL};
    }
  }
  return tempObj;
};

const isUserSignedIn = function(req) {
  const templateVars = {user: usersDatabase[req.cookies["user_Id"]]};
  if (templateVars.user) {
    return true;
  } else {
    return false;
  }
};

//Basic object databases for reference and testing
const usersDatabase = {
  "randonUserID": {
    id: "randomUserID",
    email: "randomUser@gmail.uk",
    password: "oneCupOfSugar"
  }
};

const urlDatabase = {
  b2xVn2: {longURL: "http://www.lighthouselabs.ca", userID: "randomUserID" },
  "9sm5xK": {longURL: "http://www.google.com", userID: "randomUserID" }
};

//used to load create new urls page
app.get("/urls/new", (req, res) => {
  const templateVars = {user: usersDatabase[req.cookies["user_Id"]]};
  if (isUserSignedIn(req)) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/urls");
  }
});

//post method for creating new url by giving it a random short string and returning user to the main urls page
app.post("/urls", (req, res) => {
  const templateVars = {user: usersDatabase[req.cookies["user_Id"]]};
  let urlid = generateRandomString();
  let userid = templateVars.user.id;
  urlDatabase[urlid] = { longURL: req.body.longURL, userID: userid};
  res.redirect("/urls");
});

//used to load the main url page
app.get("/urls", (req, res) => {
  let userTemp = usersDatabase[req.cookies["user_Id"]];
  let templateVars = {user: usersDatabase[req.cookies["user_Id"]],
    urls: ""};
  if (isUserSignedIn(req)) {
    templateVars = {user: usersDatabase[req.cookies["user_Id"]], urls: urlsForUser(userTemp.id)};
  }
  res.render("urls_index", templateVars);
});

//get to req to send the user to the registeration page
app.get("/register", (req, res) => {
  const templateVars = {user: usersDatabase[req.cookies["user_Id"]]};
  res.render("register", templateVars);
});

//register page post to register the user create unique id and redirect them to the main /urls page
app.post("/register", (req, res) => {
  if (doesEmailAlreadyExist(req.body.email)) {
    res.status(400);
    res.redirect("/error");
  }
  if (req.body.email === "" || req.body.password === "") {
    res.status(400);
    res.redirect("/error");
  }
  let newId = generateRandomString();
  usersDatabase[newId] = {
    id: newId,
    email: req.body.email,
    password: req.body.password
  };
  res.cookie("user_Id", usersDatabase[newId].id);
  res.redirect("/urls");
});

//deletes a url from urlDatabase
app.post("/urls/:shortURL/delete", (req, res) => {
  if (isUserSignedIn(req)) {
    const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
    const shortUrl = templateVars.shortURL;
    delete urlDatabase[shortUrl],
    res.redirect("/urls");
  } else {
    res.redirect("/error");
  }
});

//edit the long url of an existing short url
app.post("/urls/:shortURL", (req, res) => {
  if (isUserSignedIn(req)) {
    const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL};
    const shortUrl = templateVars.shortURL;
    urlDatabase[shortUrl] = req.body.longURL,
    res.redirect("/urls");
  } else {
    res.redirect("/error");
  }
});

//sends user to the short url shows page
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {user: usersDatabase[req.cookies["user_Id"]], longURL: urlDatabase[req.params.shortURL].longURL, shortURL: req.params.shortURL};
  console.log(usersDatabase[req.cookies["user_Id"].id]);
  res.render("urls_show", templateVars);
});

//get that sends the user to the login in page
app.get("/login", (req, res) => {
  const templateVars = {user: usersDatabase[req.cookies["user_Id"]]};
  res.render("login", templateVars);
});

//post that checks if the user is already a registered user and if so checks password and if all good creates cookie and signs the user in
app.post("/login", (req, res) => {
  if (doesEmailAlreadyExist(req.body.email)) {
    if (usersDatabase[doesEmailAlreadyExist(req.body.email)].password === req.body.password) {
      res.cookie("user_Id", doesEmailAlreadyExist(req.body.email));
      res.redirect("/urls");
    }
  }
  res.status(403);
  res.redirect("/error");
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_Id");
  res.redirect("/urls");
});

//sends the user to the correct corresponding long url page
app.get("/u/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL};
  const longUrl = templateVars.longURL;
  res.redirect(longUrl);
});

//catch all error if someone misstypes something or possible redirect for messing up in registration or login
app.get('/*/', (req, res) => {
  const templateVars = {user: usersDatabase[req.cookies["user_Id"]]};
  res.render("error", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});