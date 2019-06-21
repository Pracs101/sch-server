const mongoose = require('mongoose');
const _ = require('lodash');

const NoticeSchema = new mongoose.Schema({
  notice: {
    type: String,
    trim: true,
    required: true
  },
  createdAt: {
    type: String,
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  }
});

const Notice = mongoose.model('Notice', NoticeSchema);

module.exports = Notice;
