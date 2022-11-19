const express = require('express');
const path = require('path');
const utils = require('./lib/hashUtils');
const partials = require('express-partials');
const Auth = require('./middleware/auth');
const models = require('./models');

const app = express();

app.set('views', `${__dirname}/views`);
app.set('view engine', 'ejs');
app.use(partials());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));



app.get('/',
  (req, res) => {
    res.render('index');
  });

app.get('/create',
  (req, res) => {
    res.render('index');
  });

app.get('/links',
  (req, res, next) => {
    models.Links.getAll()
      .then(links => {
        res.status(200).send(links);
      })
      .error(error => {
        res.status(500).send(error);
      });
  });

app.post('/links',
  (req, res, next) => {
    var url = req.body.url;
    if (!models.Links.isValidUrl(url)) {
      // send back a 404 if link is not valid
      return res.sendStatus(404);
    }

    return models.Links.get({ url })
      .then(link => {
        if (link) {
          throw link;
        }
        return models.Links.getUrlTitle(url);
      })
      .then(title => {
        return models.Links.create({
          url: url,
          title: title,
          baseUrl: req.headers.origin
        });
      })
      .then(results => {
        return models.Links.get({ id: results.insertId });
      })
      .then(link => {
        throw link;
      })
      .error(error => {
        res.status(500).send(error);
      })
      .catch(link => {
        res.status(200).send(link);
      });
  });

/************************************************************/
// Write your authentication routes here
/************************************************************/
/*
users db => {
  id: primary key auto increment
  username:
  password:
  salt:
}
session db => {
  id: primary key auto increment
  hash:
  userId:
}
*/

//app post '/login'
app.post('/login', (req, res, next) => {
  /*
  in request body there will be a username and password
  there will also be cookies

  Users.compare -- will compare username and passwords w/ database and see if they match return boolean
    if false
    return error/ try login again

    if true
    create a session?
    somehow attach session to cookie
  */
  models.Users.get({username: req.body.username})
    .then((data) => {
      return models.Users.compare(req.body.password, data.password, data.salt);
    })
    .then((isPasswordCorrect) => {
      if (isPasswordCorrect) {
        res.redirect(201, '/');
        res.end();
      } else {
        res.redirect(500, '/login');
        res.end();
      }
    })
    .catch(()=>{
      res.redirect(500, '/login');
      res.end();
    });
});

//app post '/signup'
app.post('/signup', (req, res, next) => {
  //in request body there will be a username and a password
  //hash the password with salt
  //add username, hash, salt, and user_id to a db table
  //response: redirect to login?
  models.Users.create(req.body)
    .then(()=>{
      res.redirect(201, '/');
      res.end();
    })
    .catch(()=> {
      res.redirect(301, '/signup');
    });

});

/************************************************************/
// Handle the code parameter route last - if all other routes fail
// assume the route is a short code and try and handle it here.
// If the short-code doesn't exist, send the user to '/'
/************************************************************/

app.get('/:code', (req, res, next) => {

  return models.Links.get({ code: req.params.code })
    .tap(link => {

      if (!link) {
        throw new Error('Link does not exist');
      }
      return models.Clicks.create({ linkId: link.id });
    })
    .tap(link => {
      return models.Links.update(link, { visits: link.visits + 1 });
    })
    .then(({ url }) => {
      res.redirect(url);
    })
    .error(error => {
      res.status(500).send(error);
    })
    .catch(() => {
      res.redirect('/');
    });
});

module.exports = app;
