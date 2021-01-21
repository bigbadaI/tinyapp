const { assert } = require('chai');

const { doesEmailAlreadyExist, urlsForUser } = require('../helper.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

const urlDatabase = {
  b2xVn2: {longURL: "http://www.lighthouselabs.ca", userID: "userRandomID" },
  tsm5xK: {longURL: "http://www.google.com", userID: "userRandomID" },
  psm3xK: {longURL: "http://www.google.com", userID: "user2RandomID" }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = doesEmailAlreadyExist("user@example.com", testUsers);
    const expectedOutput = "userRandomID";
    assert.strictEqual(user, expectedOutput);
  });
  it('should not equal another users id', function() {
    const user = doesEmailAlreadyExist("user2@example.com", testUsers);
    const expectedOutput = "randomUserId";
    assert.notStrictEqual(user, expectedOutput);
  });
  it('should return undefined if no email is entered', function() {
    const user = doesEmailAlreadyExist("", testUsers);
    const expectedOutput = undefined;
    assert.strictEqual(user, expectedOutput);
  });
  it('should return undefined if email is not in our database', function() {
    const user = doesEmailAlreadyExist("hello@hotmail.ca", testUsers);
    const expectedOutput = undefined;
    assert.strictEqual(user, expectedOutput);
  });
  it('should return an object containing urls the user has made', function() {
    const user = urlsForUser("userRandomID", urlDatabase);
    let tempObj = {b2xVn2: {longURL: "http://www.lighthouselabs.ca", userID: "userRandomID"},
      tsm5xK: {longURL: "http://www.google.com", userID: "userRandomID"}};
    const expectedOutput = tempObj;
    assert.deepEqual(user, expectedOutput);
  });
});