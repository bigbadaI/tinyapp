const express = require("express");
const app = express();
const PORT = 8080; //default port 8080
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const cookieSession = require("cookie-session");
const helper = require('./helper');
const methodOverride = require("method-override");

//middleware
app.use(methodOverride('_method'));
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(cookieSession({
  name: "session",
  keys: ['key1']
}));

//If user is not signed in most cases will redirect here for the user to sign in and use our app
app.get('/welcome', (req, res) => {
  const templateVars = { user: helper.usersDatabase[req.session.username] };

  return res.render("welcome", templateVars);
});

//used to load create new urls page
app.get("/urls/new", (req, res) => {
  const templateVars = { user: helper.usersDatabase[req.session.username] };
  if (helper.isUserSignedIn(req)) {
    return res.render("urls_new", templateVars);
  } else {
    return res.redirect("/login");
  }
});

//post method for creating new url by giving it a random short string and then sending the user to the page for that short url
app.post("/urls", (req, res) => {
  if (helper.isUserSignedIn) {
    const templateVars = { user: helper.usersDatabase[req.session.username] };
    let urlid = helper.generateRandomString();
    let userid = templateVars.user.id;
    helper.urlDatabase[urlid] = { longURL: req.body.longURL, userID: userid };
    return res.redirect(`/urls/${urlid}`);
  } else {
    return res.redirect("/welcome");
  }
});

//used to load the main url page
app.get("/urls", (req, res) => {
  if (!helper.isUserSignedIn(req)) {
    return res.redirect("/welcome");
  }
  let userTemp = req.session.username;
  let templateVars = { user: helper.usersDatabase[req.session.username], urls: helper.urlsForUser(userTemp, helper.urlDatabase) };
  
  return res.render("urls_index", templateVars);
});

//get to send the user to the registeration page
app.get("/register", (req, res) => {
  if (!helper.isUserSignedIn(req)) {
    const templateVars = { user: helper.usersDatabase[req.session.username] };
    return res.render("register", templateVars);
  }
  return res.redirect("/urls");
});

//register page post to register the user create unique id and redirect them to the main /urls page
app.post("/register", (req, res) => {
  if (helper.doesEmailAlreadyExist(req.body.email, helper.usersDatabase)) {
    res.status(400);
    res.redirect("/welcome");
    return;
  }
  if (req.body.email === "" || req.body.password === "") {
    res.status(400);
    res.redirect("/welcome");
    return;
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
  return res.redirect("/urls");
});


//edit the long url of an existing short url
app.put("/urls/:shortURL", (req, res) => {
  if (helper.isUserSignedIn(req)) {
    const templateVars = { shortURL: req.params.shortURL, longURL: helper.urlDatabase[req.params.shortURL].longURL };
    const shortUrl = templateVars.shortURL;
    helper.urlDatabase[shortUrl].longURL = req.body.longURL;
    return res.redirect("/urls");
  } else {
    return res.redirect("/welcome");
  }
});

//deletes a url from urlDatabase
app.delete("/urls/:shortURL", (req, res) => {
  if (helper.isUserSignedIn(req)) {
    const templateVars = { shortURL: req.params.shortURL, longURL: helper.urlDatabase[req.params.shortURL] };
    const shortUrl = templateVars.shortURL;
    delete helper.urlDatabase[shortUrl];
    return res.redirect("/urls");
  } else {
    return res.redirect("/welcome");
  }
});
//sends user to the short url shows page
app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL };
  if (!helper.isUserSignedIn(req)) {
    return res.redirect("/welcome");
  }
  let tempUrllist = helper.urlsForUser(req.session.username, helper.urlDatabase);
  let templist2 = Object.keys(tempUrllist);
  if (!templist2.includes(templateVars.shortURL)) {
    return res.redirect("/urls");
  }
  templateVars = { user: helper.usersDatabase[req.session.username], longURL: helper.urlDatabase[req.params.shortURL].longURL, shortURL: req.params.shortURL };
  res.render("urls_show", templateVars);
});

//get that sends the user to the login in page
app.get("/login", (req, res) => {
  if (!helper.isUserSignedIn(req)) {
    const templateVars = { user: helper.usersDatabase[req.session.username] };
    return res.render("login", templateVars);
  }
  return res.redirect("/urls");
});

//post that checks if the user is already a registered user and if so checks password and if all good creates cookie and signs the user in
app.post("/login", (req, res) => {
  let tempPass = req.body.password;
  let username = helper.doesEmailAlreadyExist(req.body.email, helper.usersDatabase);
  if (username) {
    if (bcrypt.compareSync(tempPass, helper.usersDatabase[username].password)) {
      req.session.username = username;
      return res.redirect("/urls");
    } else {
      res.status(403);
      res.redirect("/welcome");
      return;
    }
  } else {
    res.status(403);
    res.redirect("/welcome");
    return;
  }
});

//clear cookies and returns to the welcome page but procedure says to redirect to urls which when not logged in returns to welcome page
app.post("/logout", (req, res) => {
  req.session = null;
  return res.redirect("/urls");
});

//sends the user to the correct corresponding long url page
app.get("/u/:shortURL", (req, res) => {
  let urlList = Object.keys(helper.urlDatabase);
  let templateVars = { shortURL: req.params.shortURL };
  if (!urlList.includes(templateVars.shortURL)) {
    return res.redirect("/error");
  }
  templateVars = { shortURL: req.params.shortURL, longURL: helper.urlDatabase[req.params.shortURL].longURL };
  const longUrl = templateVars.longURL;
  res.redirect(longUrl);
});


app.get("/", (req, res) => {
  if (helper.isUserSignedIn(req)) {
    return res.redirect("/urls");
  } else {
    return res.redirect("/login");
  }
});


//catch all error if someone misstypes something
app.get('/*/', (req, res) => {
  const templateVars = { user: helper.usersDatabase[req.session.username] };

  return res.render("error", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
