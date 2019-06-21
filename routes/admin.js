const express = require('express');
const _ = require('lodash');

const Admin = require('../models/admin');

const router = express.Router();

router.post('/signup', (req, res) => {
  let resBody = {};
  let error = {};
  let body = _.pick(req.body, ['uname', 'password']);
  if(body.password && body.uname) {
    body.createdAt = new Date().getTime();
    const admin = new Admin(body);
    admin.save()
      .then((u) => {
        admin.generateAuthToken()
          .then((token) => {
            resBody.status = 'ok';
            resBody.data = _.pick(admin, ['uname']);
            resBody.data.adminID = u._id;
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
        console.log(e);
        error.msg = 'User already exist!';
        resBody.error = error;
        resBody.status = 'error';
        return res.status(400).send(resBody);
      });
  } else {
    error.msg = 'Invalid data.';
    resBody.error = error;
    resBody.status - 'error';
    return res.status(400).send(resBody);
  }
});

router.post('/login', (req, res) => {
  const body = _.pick(req.body, ['uname', 'password']);
  let resBody = {};
  let error = {};
  let data = {};
  Admin.findOne({uname: body.uname})
    .then(admin => {
      data.uname = admin.uname;
      data._id = admin._id;
      return admin.generateAuthToken()
    })
      .then(token => {
        if(token) {
          resBody.status = 'ok';
          resBody.data = data;
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

module.exports = router;
