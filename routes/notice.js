const express = require('express');
const _ = require('lodash');

const Notice = require('../models/notice');
const { authenticate } =require('../middleware/adminMiddleware');

const router = express.Router();

router.post('/add', (req, res) => {
  let resBody = {};
  let error = {};
  const body = _.pick(req.body, ['notice', 'createdBy']);
  body.createdAt = new Date().getTime();
  const notice = new Notice(body);
  notice.save()
    .then(nt => {
      resBody.status = 'ok';
      resBody.data = nt;
      return res.send(resBody);
    })
    .catch(e => {
      resBody.status = 'error';
      error = {
        msg: 'Unable to save notice!'
      }
      resBody.error = error;
      return res.status(400).send(resBody);
    });
});

router.get('/notices', (req, res) => {
  Notice.find()
    .sort({ createdAt: -1 })
    .limit(10)
    .then((posts) => {
      return res.send({posts});
  }, (e) => {
    return res.status(400).send(e);
  });
});

module.exports = router;
