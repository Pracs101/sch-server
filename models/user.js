const mongoose = require('mongoose');
const validator = require('validator');
const _ = require('lodash');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  fname: {
    type: String,
    required: true,
    unique: true,
    minlength: 3,
    trim: true
  },
  lname: {
    type: String,
    required: true,
    minlength: 3,
    trim: true
  },
  phoneNumber: {
    type: Number,
    required: true,
    unique: true,
    minlength: 10,
    maxlength: 10
  },
  email: {
    type: String,
    trim: true,
    required: true,
    minlength: 3,
    unique: true,
    sparse: true,
    validate: {
      validator: validator.isEmail,
      message: '{VALUE} is not a valid email.'
    }
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
  },
  profile: {
    dob: {
      type: String
    },
    state: {
      type: String,
      trim: true
    },
    religion: {
      type: String,
      trim: true
    },
    caste: {
      type: String,
      trim: true
    },
    income: {
      type: Number,
      trim: true
    },
    isNRI: {
      type: Boolean
    }
  },
  education: [
    {
      degreeName: {
        type: String,
        required: true,
        trim: true
      },
      schoolName: {
        type: String,
        required: true,
        trim: true
      },
      percentage: {
        type: Number,
        required: true,
      },
      passYear: {
        type: String,
        required: true,
        trim: true
      },
      isKt: {
        type: Boolean,
        required: true,
        default: false
      }
    }
  ]
});

UserSchema.statics.editUser = function(body, id) {
  const User = this;

  return User.findById(id)
    .then((user) => {
      Object.keys(body).forEach(key => {
        user[key] = body[key];
      });
      return user.save();
    })
}

UserSchema.methods.generateAuthToken = function() {
  const user = this;
  const access = 'auth';
  const token = jwt.sign({_id: user._id.toHexString(), access}, process.env.JWT_SECRET).toString();
  user.tokens = user.tokens.concat([{access, token}]);
  return user.save().then(() => {
    return token;
  });
};

UserSchema.methods.removeToken = function(token) {
  const user = this;
  return user.update({
    $pull: {
      tokens: {
        token
      }
    }
  });
};

UserSchema.statics.findByCredentials = function(phoneNumber, password) {
  const User = this;
  return User.findOne({phoneNumber}).then((user) => {
    if(!user) {
      return Promise.reject();
    }
    return new Promise((resolve, reject) => {
      bcrypt.compare(password, user.password, (err, res) => {
        if(res) {
          resolve(user);
        } else {
          reject();
        }
      });
    });
  });
}

UserSchema.statics.findByToken = function(token) {
  const User = this;
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (e) {
    return Promise.reject('Query error.');
  }
  return User.findOne({
    '_id': decoded._id,
    'tokens.token': token,
    'tokens.access': 'auth'
  });

}

UserSchema.pre('save', function(next){
  const user = this;
  if(user.isModified('password')) {
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(user.password, salt, (err, hash) => {
        user.password = hash;
        next();
      });
    });
  } else {
    next();
  }
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
