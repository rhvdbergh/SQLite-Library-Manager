var models = require('../models');
var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'SQLite Library Manager' });
});

/* GET new books page. */
router.get('/books/new', function(req, res, next) {
  res.render('new_book', { title: 'SQLite Library Manager: New Book' });
});

module.exports = router;
