'use strict';

let express = require('express');
let app = express();
let apiRouter = express.Router();
let mongoose = require('mongoose');
var bodyParser = require('body-parser');
mongoose.connect('mongodb://localhost/db');

// ROUTERS
require('./router/users-router')(apiRouter);
require('./router/files-router')(apiRouter);

app.use(bodyParser.json());
app.use('/', apiRouter, (req, res) => {

});

app.listen(4000, () => {
  console.log('Server started on port 4000');
});
