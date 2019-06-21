const Admin = require('../models/admin');

const authenticate = (req, res, next) => {
  let error = {};
  let resBody = {};
  const token = req.header('x-auth');
  Admin.findByToken(token)
    .then(admin => {
      if(!admin) return Promise.reject('Admin does not found.');
      req.admin = admin;
      req.token = token;
      next();
    })
    .catch(e => {
      error.msg = 'Something went wrong!';
      resBody.error = error;
      resBody.status = 'error';
      return res.status(401).send(resBody);
    });
}

module.exports = {
  authenticate
}
