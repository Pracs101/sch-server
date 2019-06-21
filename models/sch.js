const mongoose = require('mongoose');
const _ = require('lodash');

const SchSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    trim: true
  },
  schName: {
    type: String,
    required: true
  },
  overview: {
    type: String,
    required: true,
    trim: true
  },
  criteria: [
    {
      type: String,
      trim: true
    }
  ],
  benifits: {
    type: String,
    required: true,
    trim: true
  },
  link: {
    type: String,
    required: true,
    trim: true
  },
  docs: [
    {
      type: String,
      trim: true
    }
  ],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  // duration: {
  //   start: {
  //     type: String,
  //     required: true
  //   },
  //   end: {
  //     type: String,
  //     required: true
  //   }
  // },
  updatedBy: {
    type:mongoose.Schema.Types.ObjectId
  },
  updatedAt: {
    type: String,
    default: -1
  }
});

SchSchema.statics.editSch = function(body, id) {
  const Sch = this;

  return Sch.findById(id)
    .then((sch) => {
      Object.keys(body).forEach(key => {
        sch[key] = body[key];
      });
      return sch.save();
    })
}

const Sch = mongoose.model('Sch', SchSchema);

module.exports = Sch;
