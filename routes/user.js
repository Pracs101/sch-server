const express = require('express');
const _ = require('lodash');

const User = require('../models/user');
const { validateEmail, validatePhoneNumber } = require('../utility/utility');
const { authenticate } = require('../middleware/middleware');

const router = express.Router();

router.post('/signup', (req, res) => {
  let resBody = {};
  let error = {};
  let body = _.pick(req.body, ['fname', 'lname', 'phoneNumber', 'email', 'password']);
  let flag = true;
  if(body.phoneNumber.length > 10 || body.phoneNumber < 10) flag = false;
  if(!validatePhoneNumber(body.phoneNumber)) flag = false;
  if(!validateEmail(body.email)) flag = false;
  if(body.password && body.phoneNumber && flag) {
    body.createdAt = new Date().getTime();
    const user = new User(body);
    user.save()
      .then((u) => {
        user.generateAuthToken()
          .then((token) => {
            resBody.status = 'ok';
            resBody.data = _.pick(user, ['fname', 'lname', 'phoneNumber', 'email']);
            resBody.data.userID = u._id;
            return res.set({
              'Access-Control-Expose-Headers': 'x-auth',
              'x-auth': token
            }).send(resBody);
          })
          .catch(e => {
            error.msg = 'Validation error.';
            resBody.error = error;
            resBody.status = 'error';
            return res.status(400).send(resBody);
          });
      })
      .catch(e => {
        error.msg = 'User already exist!';
        resBody.error = error;
        resBody.status = 'error';
        return res.status(400).send(resBody);
      });
  } else {
    error.msg = 'Invalid data.';
    resBody.error = error;
    resBody.status = 'error';
    return res.status(400).send(resBody);
  }
});

router.post('/login', (req, res) => {
  const body = _.pick(req.body, ['phoneNumber', 'password']);
  let resBody = {};
  let error = {};
  let data = {};
  User.findByCredentials(body.phoneNumber, body.password)
    .then(user => {
      data = _.pick(user, ['fname', 'lname', 'phoneNumber', 'email']);
      resBody.status = 'ok';
      data.userID = user._id;
      resBody.data = data;
      return user.generateAuthToken()
    })
      .then(token => {
        if(token) {
          return res.set({
            'Access-Control-Expose-Headers': 'x-auth',
            'x-auth': token
          }).send(resBody);
        } else {
          error.msg = 'Something went wrong!';
          resBody.status = 'error';
          resBody.error = error;
          return res.status(400).send(resBody);
        }
      })
    .catch(e => {
      error.msg = 'Invalid credentials!';
      resBody.status = 'error';
      resBody.error = error;
      return res.status(400).send(resBody);
    });
});

router.post('/profile', (req, res) => {
  let body = _.pick(req.body, ['profile', 'education']);
  let resBody = {};
  let error = {};
  let id = req.body.userID;
  User.editUser(body, id)
    .then(user => {
      if(user) {
        resBody.status = 'ok';
        resBody.data = user;
        return res.send(resBody);
      } else {
        resBody.status = 'error';
        error = {
          msg: 'Not Found!'
        }
        resBody.error = error;
        return res.status(404).send(resBody);
      }
    })
    .catch(e => {
      resBody.status = 'error';
      error = {
        msg: 'Unable to update!'
      }
      resBody.error = error;
      return res.status(400).send(resBody);
    });
});

router.get('/profile/data/:id', (req, res) => {
  User.findById(req.params.id)
    .then(user => {
      if(user) {
        return res.send(user);
      } else {
        return res.status(404).send('Not found!');
      }
    })
    .catch(e => {
      return res.status(400).send('Unable to find!');
    });
});

module.exports = router;
