const express = require("express");
const app = express();
const PORT = 8080; //default port 8080
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

const generateRandomString = function() {
  return Math.random().toString(36).substr(6);
};

  
const users = {
  "randonUserID": {
    id: "randomUserID",
    email: "randomUser@gmail.uk",
    password: "oneCupOfSugar"
  }

};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
//This page was just for testing purposes
// app.get("/", (req, res) => {
//   res.send("Hello");
// });

//used to load create new urls page
app.get("/urls/new", (req, res) => {
  const templateVars = {username: req.cookies["username"]};
  res.render("urls_new", templateVars);
});

//post method for creating new url by giving it a random short string and returning user to the main urls page
app.post("/urls", (req, res) => {
  console.log(req.body);
  let smallUrl = generateRandomString();
  urlDatabase[smallUrl] = req.body.longURL,
  res.redirect(`/urls/${smallUrl}`);
});

//used to load the main url page
app.get("/urls", (req, res) => {
  const templateVars = {urls: urlDatabase, username: req.cookies["username"]};
  res.render("urls_index", templateVars);
});

//get to req to send the user to the registeration page
app.get("/register", (req, res) => {
  const templateVars = {username: req.cookies["username"]};
  res.render("register", templateVars);
});

//register page post to register the user create unique id and redirect them to the main /urls page
app.post("/register", (req, res) => {
  let newId = generateRandomString();
  users[newId] = {
    id: newId,
    email: req.body.email,
    password: req.body.password
  };
  res.cookie(newId);
  console.log(users);
  res.redirect("/urls");
});

//deletes a url from urlDatabase
app.post("/urls/:shortURL/delete", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
  const shortUrl = templateVars.shortURL;
  delete urlDatabase[shortUrl],
  res.redirect("/urls");
});

//edit the long url of an existing short url
app.post("/urls/:shortURL", (req, res) => {
  console.log(req.body);
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
  const shortUrl = templateVars.shortURL;
  urlDatabase[shortUrl] = req.body.longURL,
  res.redirect(`/urls`);
});

//sends user to the short url shows page
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], username: req.cookies["username"]};
  
  res.render("urls_show", templateVars);
});

app.post("/login", (req, res) => {
  res.cookie("username", req.body.username);

  console.log(req.body.username);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls");
});

//sends the user to the correct corresponding long url page
app.get("/u/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
  const longUrl = templateVars.longURL;
  res.redirect(longUrl);
});


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});