const models = require('../models/index.js');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'SQLite Library Manager' });
});

/* GET new books page. */
router.get('/new_book.html', function(req, res, next) {

  res.render('new_book', { title: 'SQLite Library Manager: New Book' });
});

/* GET all books page. */
router.get('/all_books.html', function(req, res, next) {

  models.Book.findAll()
    .then((books) => res.render('all_books', { books: books }));
});

/* GET overdue books page. */
router.get('/overdue_books.html', function(req, res, next) {
  
  const today = new Date();
  let book_ids =[];

  models.Loan.findAll( {where: { return_by: {[Op.lt]: today } }})
    .then((loans) =>
    {
      loans.forEach((loan) => book_ids.push(loan.dataValues.book_id));
      // return book_ids;
    })
    .then(() => {
      console.log('book ids', book_ids);
      models.Book.findAll( {where: { id: [...book_ids]}})
        .then((books) => res.render('overdue_books', { books: books  }))
    })
});

/* GET checked books page. */
router.get('/checked_books.html', function(req, res, next) {
  res.render('checked_books', { title: 'SQLite Library Manager: Books Checked Out' });
});

/* GET all loans page. */
router.get('/all_loans.html', function(req, res, next) {
  res.render('all_loans', { title: 'SQLite Library Manager: All Loans' });
});

/* GET all patrons page. */
router.get('/all_patrons.html', function(req, res, next) {
  res.render('all_patrons', { title: 'SQLite Library Manager: All Patrons' });
});

/* GET new patrons page. */
router.get('/new_patron.html', function(req, res, next) {
  res.render('new_patron', { title: 'SQLite Library Manager: New Patron' });
});

/* GET new loans page. */
router.get('/new_loan.html', function(req, res, next) {
  res.render('new_loan', { title: 'SQLite Library Manager: New Loan' });
});

/* GET overdue loans page. */
router.get('/overdue_loans.html', function(req, res, next) {
  res.render('overdue_loans', { title: 'SQLite Library Manager: Overdue Loans' });
});

/* GET checked loans page. */
router.get('/checked_loans.html', function(req, res, next) {
  res.render('checked_loans', { title: 'SQLite Library Manager: Loans Checked Out' });
});


module.exports = router;
