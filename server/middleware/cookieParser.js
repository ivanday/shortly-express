const auth = require('./auth');

const parseCookies = (req, res, next) => {

  if (req.headers.cookie !== undefined) {
    var arrayOfCookies = req.headers.cookie.replace(/\s/g, '').split(';').map(pairs => {
      let [key, value] = pairs.split('=');
      req.cookies[key] = value;
    });
  }
  next();

};
// shortlyid=8a864482005bcc8b968f2b18f8f7ea490e577b20;
module.exports = parseCookies;

//shortlyid=8a864482005bcc8b968f2b18f8f7ea490e577b20 shortlyid=18ea4fb6ab3178092ce936c591ddbb90c99c9f66; otherCookie=2a990382005bcc8b968f2b18f8f7ea490e990e78; anotherCookie=8a864482005bcc8b968f2b18f8f7ea490e577b20