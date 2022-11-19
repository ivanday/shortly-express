const models = require('../models');
const Promise = require('bluebird');

module.exports.createSession = (req, res, next) => {
  models.Sessions.create()
    .then((data)=> {
      console.log('data before', data);
      let id = data.insertId;
      return models.Sessions.get({id: id});
    })
    .then((data) => {

      req.session = data;
      console.log(req.session.hash);
    });
  next();

};

/************************************************************/
// Add additional authentication middleware functions below
/************************************************************/

