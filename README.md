# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly). Project asked for couple weird cases like logging out redirect to /urls which according to instructions should "returns HTML with a relevant error message" which seemed weird in my opinion so I decided to add a Welcome page to fix some of those weird cases I hope this is alright solution.

## Final Product

!["Screenshot of the main Urls page"](https://github.com/bigbadaI/tinyapp/blob/master/docs/urlspage.png?raw=true)
!["Screenshot of Welcome page when not signed in"](https://github.com/bigbadaI/tinyapp/blob/master/docs/welcome.png?raw=true)
!["Screenshot of Create New Urls page"](https://github.com/bigbadaI/tinyapp/blob/master/docs/createnewurl.png?raw=true)

## Dependencies

- Node.js
- Express
- EJS
- bcrypt
- body-parser
- cookie-session
- method-override

## Getting Started

- Install all dependencies (using the `npm install` command).
- Run the development web server using the `node express_server.js` command.