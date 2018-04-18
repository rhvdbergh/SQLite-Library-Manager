const models = require('../models/index.js');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const express = require('express');
const router = express.Router();
const { Book, Loan, Patron } = require('../models/index.js');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { });
});

/* GET new books page. */
router.get('/new_book.html', function(req, res, next) {

  res.render('new_book', { book: Book.build() });
});

router.post('/new_book.html', function(req, res, next) {

  Book.create(req.body)
    .then(() => {
      res.redirect('all_books.html');
    })
    .catch((error) => {
      if (error.name === "SequelizeValidationError") {
        res.render('new_book', { book: Book.build(req.body), errors: error.errors });
      } else { throw error; }
    }).catch((error) => console.log('error', error));
  
});

/* GET all books page. */
router.get('/all_books.html', function(req, res, next) {

  Book.findAll()
    .then((books) => res.render('all_books', { books: books }));
});

/* GET overdue books page. */
router.get('/overdue_books.html', function(req, res, next) {
  
  const today = new Date();
  let book_ids =[];

  Loan.findAll( 
      { where: 
        { return_by: {[Op.lt]: today }, 
        returned_on: {[Op.eq]: null} }
      })
    .then((loans) =>
    {
      loans.forEach((loan) => book_ids.push(loan.dataValues.book_id));
    })
    .then(() => {
      Book.findAll( 
        {where: 
          { id: [...book_ids]}
        })
        .then((books) => res.render('overdue_books', { books: books  }))
    })
});

/* GET checked books page. */
router.get('/checked_books.html', function(req, res, next) {

  let book_ids =[];
  
  Loan.findAll( 
      { where: 
        { loaned_on: {[Op.not]: null}, // test for empty cell
        returned_on: null} 
      })
  .then((loans) =>
  {
    loans.forEach((loan) => book_ids.push(loan.dataValues.book_id));
  })
  .then(() => {
    Book.findAll( 
      {where: 
        { id: [...book_ids]}
      })
      .then((books) => res.render('checked_books', { books: books  }))
  })
});

/* GET all loans page. */
router.get('/all_loans.html', function(req, res, next) {
  res.render('all_loans', { title: 'SQLite Library Manager: All Loans' });
});

/* GET all patrons page. */
router.get('/all_patrons.html', function(req, res, next) {

  Patron.findAll()
  .then((patrons) => res.render('all_patrons', { patrons: patrons }));
});

/* GET new patrons page. */
router.get('/new_patron.html', function(req, res, next) {

  res.render('new_patron', { patron: Patron.build() });
});

/* POST new patrons info */
router.post('/new_patron.html', function(req, res, next) {

  Patron.create(req.body)
    .then(() => {
      res.redirect('all_patrons.html');
    })
    .catch((error) => {
      if (error.name === "SequelizeValidationError") {
        res.render('new_patron', { patron: Patron.build(req.body), errors: error.errors });
      } else { throw error; }
    }).catch((error) => console.log('error', error));
  
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
