const express = require("express");
const app = express();
const PORT = 8080; //default port 8080
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const cookieSession = require("cookie-session");
const helper = require('./helper');

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(cookieSession({
  name: "session",
  keys: ['key1']
}));

//functions for use in different get and post calls



//used to load create new urls page
app.get("/urls/new", (req, res) => {
  const templateVars = {user: helper.usersDatabase[req.session.username]};
  if (helper.isUserSignedIn(req)) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/urls");
  }
});

//post method for creating new url by giving it a random short string and returning user to the main urls page
app.post("/urls", (req, res) => {
  const templateVars = {user: helper.usersDatabase[req.session.username]};
  let urlid = helper.generateRandomString();
  let userid = templateVars.user;
  helper.urlDatabase[urlid] = { longURL: req.body.longURL, userID: userid};
  res.redirect("/urls");
});

//used to load the main url page
app.get("/urls", (req, res) => {
  let userTemp = helper.usersDatabase[req.session.username];
  let templateVars = {user: helper.usersDatabase[req.session.username],
    urls: ""};
  if (helper.isUserSignedIn(req)) {
    templateVars = {user: helper.usersDatabase[req.session.username], urls: helper.urlsForUser(userTemp)};
  }
  res.render("urls_index", templateVars);
});

//get to req to send the user to the registeration page
app.get("/register", (req, res) => {
  const templateVars = {user: helper.usersDatabase[req.session.username]};
  res.render("register", templateVars);
});

//register page post to register the user create unique id and redirect them to the main /urls page
app.post("/register", (req, res) => {
  if (helper.doesEmailAlreadyExist(req.body.email, helper.usersDatabase)) {
    res.status(400);
    res.redirect("/error");
  }
  if (req.body.email === "" || req.body.password === "") {
    res.status(400);
    res.redirect("/error");
  }
  let newId = helper.generateRandomString();
  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(req.body.password, salt);
  helper.usersDatabase[newId] = {
    id: newId,
    email: req.body.email,
    password: hashedPassword
  };
  req.session.username = helper.usersDatabase[newId].id;
  console.log(req.session.username);
  res.redirect("/urls");
});

//deletes a url from urlDatabase
app.post("/urls/:shortURL/delete", (req, res) => {
  if (helper.isUserSignedIn(req)) {
    const templateVars = { shortURL: req.params.shortURL, longURL: helper.urlDatabase[req.params.shortURL]};
    const shortUrl = templateVars.shortURL;
    delete helper.urlDatabase[shortUrl],
    res.redirect("/urls");
  } else {
    res.redirect("/error");
  }
});

//edit the long url of an existing short url
app.post("/urls/:shortURL", (req, res) => {
  if (helper.isUserSignedIn(req)) {
    const templateVars = { shortURL: req.params.shortURL, longURL: helper.urlDatabase[req.params.shortURL].longURL};
    const shortUrl = templateVars.shortURL;
    helper.urlDatabase[shortUrl] = req.body.longURL,
    res.redirect("/urls");
  } else {
    res.redirect("/error");
  }
});

//sends user to the short url shows page
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {user: helper.usersDatabase[req.session.username], longURL: helper.urlDatabase[req.params.shortURL].longURL, shortURL: req.params.shortURL};
  // console.log(usersDatabase[req.cookies["user_Id"].id]);
  res.render("urls_show", templateVars);
});

//get that sends the user to the login in page
app.get("/login", (req, res) => {
  const templateVars = {user: helper.usersDatabase[req.session.username]};
  res.render("login", templateVars);
});

//post that checks if the user is already a registered user and if so checks password and if all good creates cookie and signs the user in
app.post("/login", (req, res) => {
  let tempPass = req.body.password;
  let username = helper.doesEmailAlreadyExist(req.body.email, helper.usersDatabase);
  console.log(username);
  if (username) {
    if (bcrypt.compareSync(tempPass, helper.usersDatabase[username].password)) {
      req.session.username = username;
      res.redirect("/urls");
    }
  }
  res.status(403);
  res.redirect("/error");
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

//sends the user to the correct corresponding long url page
app.get("/u/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: helper.urlDatabase[req.params.shortURL].longURL};
  const longUrl = templateVars.longURL;
  res.redirect(longUrl);
});

//catch all error if someone misstypes something or possible redirect for messing up in registration or login
app.get('/*/', (req, res) => {
  const templateVars = {user: helper.usersDatabase[req.session.username]};
  res.render("error", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
