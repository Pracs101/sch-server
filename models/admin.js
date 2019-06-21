const mongoose = require('mongoose');
const validator = require('validator');
const _ = require('lodash');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const AdminSchema = new mongoose.Schema({
  uname: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  tokens: [
    {
      access: {
        type: String,
        required: true
      },
      token: {
        type: String,
        required: true
      }
    }
  ],
  createdAt: {
    type: String,
    required: true
  }
});

AdminSchema.methods.generateAuthToken = function() {
  const admin = this;
  const access = 'auth';
  const token = jwt.sign({_id: admin._id.toHexString(), access}, process.env.JWT_SECRET).toString();
  admin.tokens = admin.tokens.concat([{access, token}]);
  return admin.save().then(() => {
    return token;
  });
};

AdminSchema.methods.removeToken = function(token) {
  const admin = this;
  return admin.update({
    $pull: {
      tokens: {
        token
      }
    }
  });
};

AdminSchema.statics.findByCredentials = function(email, password) {
  const Admin = this;
  return Admin.findOne({email}).then((admin) => {
    if(!admin) {
      return Promise.reject();
    }
    return new Promise((resolve, reject) => {
      bcrypt.compare(password, admin.password, (err, res) => {
        if(res) {
          resolve(admin);
        } else {
          reject();
        }
      });
    });
  });
}

AdminSchema.statics.findByToken = function(token) {
  const Admin = this;
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (e) {
    return Promise.reject('Query error.');
  }
  return Admin.findOne({
    '_id': decoded._id,
    'tokens.token': token,
    'tokens.access': 'auth'
  });

}

AdminSchema.pre('save', function(next){
  const admin = this;
  if(admin.isModified('password')) {
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(admin.password, salt, (err, hash) => {
        admin.password = hash;
        next();
      });
    });
  } else {
    next();
  }
});

const Admin = mongoose.model('Admin', AdminSchema);

module.exports = Admin;
