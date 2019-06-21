const express = require('express');
const _ = require('lodash');

const Sch = require('../models/Sch');
const { authenticate } =require('../middleware/adminMiddleware');

const router = express.Router();

// Add
router.post('/add', (req, res) => {
  let resBody = {};
  let error = {};
  let body = _.pick(req.body, ['category', 'schName', 'overview', 'criteria', 'benifits', 'link', 'docs', 'createdBy', 'duration']);
  body.createdAt = new Date().getTime();
  const sch = new Sch(body);

  sch.save()
    .then(s => {
      resBody.status = 'ok';
      resBody.data = s;
      return res.send(resBody);
    })
    .catch(e => {
      resBody.status = 'error';
      error = {
        msg: 'Unable to add!'
      }
      resBody.error = error;
      return res.status(400).send(resBody);
    })
});

// Del
router.delete('/rmv', authenticate, (req, res) => {
  let resBody = {};
  let error = {};
  const body = _.pick(req.body, ['schID']);
  Sch.findByIdAndRemove(body.schID)
    .then(r => {
      if(r) {
        resBody.status = 'ok';
        resBody.data = body.schID;
        return res.send(resBody);
      } else {
        resBody.status = 'error';
        error = {
          msg: 'Not found!'
        };
        resBody.error = error;
        res.status(404).send(resBody);
      }
    })
    .catch(e => {
      resBody.status = 'error';
      error = {
        msg: 'Unable to delete scholership!'
      }
      return res.status(400).end(resBody);
    })
});

// Update
router.post('/update', authenticate, (req, res) => {
  let resBody = {};
  let error = {};
  let body = _.pick(req.body, ['category', 'schName', 'overview', 'criteria', 'benifits', 'link', 'docs', 'updatedBy', 'duration']);
  const id = req.body.schID;
  body.updatedAt = new Date().getTime();
  Sch.editSch(body, id)
  .then(s => {
    resBody.status = 'ok';
    resBody.data = s;
    return res.send(resBody);
  })
  .catch(e => {
    resBody.status = 'error';
    error = {
      msg: 'Unable to update!'
    }
    resBody.error = error;
    return res.status(400).send(resBody);
  })
});

router.get('/schs', (req, res) => {
  Sch.find({})
    .sort({ createdAt: -1 })
    .then(sch => {
      return res.send(sch);
    })
    .catch(e => {
      return res.status(400).send(e);
    });
});

module.exports = router;
