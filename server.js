require('./config/config.js');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');

const {mongoose} = require('./mongoose/mongoose');
const adminRoutes = require('./routes/admin');
const userRoutes = require('./routes/user');
const noticeRoutes = require('./routes/notice');
const schRoutes = require('./routes/sch');

const app = express();
const port = process.env.PORT;

app.use(bodyParser.json());
app.use(cors());
app.use(helmet());

// Routes
app.use('/admin', adminRoutes);
app.use('/user', userRoutes);
app.use('/notice', noticeRoutes);
app.use('/scholership', schRoutes)

app.listen(port, () => {
  console.log(`Server is running on port ${port}.`);
});
