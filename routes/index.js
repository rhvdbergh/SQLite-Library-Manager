const models = require('../models/index.js');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const express = require('express');
const router = express.Router();
const { Book, Loan, Patron } = require('../models/index.js');

////////////////////////////////
//       HELPER METHODS       //
////////////////////////////////

// returns date object in the form yyyy-mm-dd
function formatDate(date) {
  if (date) {
    return `${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
  } else return null;
}

////////////////////////////////
//         HOME PAGE          //
////////////////////////////////

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { });
});

////////////////////////////////
//           BOOKS            //
////////////////////////////////

/* GET new books page. */
router.get('/new_book.html', function(req, res, next) {

  res.render('new_book', { book: Book.build(), title: 'New Book', button_message: 'Create New Book' });
});

/* POST new book. */
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
    .then((books) => res.render('all_books', { books: books, title: "All Books" }));
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
        .then((books) => res.render('overdue_books', { books: books, title: 'Overdue Books'  }))
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
      .then((books) => res.render('checked_books', { books: books, title: 'Books Checked Out'  }))
  })
});

/* GET edit book page. */
router.get('/book/:id', function(req, res, next) {
  Book.findById(req.params.id)
  .then((book) => {
    res.render('book_detail', { book: book, title: book.dataValues.title, button_message: 'Update' })
  });
});

////////////////////////////////
//           PATRON           //
////////////////////////////////

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

////////////////////////////////
//            LOANS           //
////////////////////////////////

/* GET new loans page. */
router.get('/new_loan.html', function(req, res, next) {
  
  let today = new Date();
  today = formatDate(today);
  let returnDate = new Date();
  returnDate.setDate(returnDate.getDate() + 7);
  returnDate = formatDate(returnDate);
  
  let checked_out_books =[];
  
  Loan.findAll( 
    { where: 
      { returned_on: null} // these are checked out books, not yet returned
    })
    .then((loans) =>
    {
      loans.forEach((loan) => checked_out_books.push(loan.dataValues.book_id));
    })
    .then(() => {
      Book.findAll({where: 
        { id: {[Op.notIn]: [...checked_out_books]}}
      })
      .then((books) => {
        if (books.length > 0) { // check to see if there actually are books that can be taken out in the database
          Patron.findAll()
          .then((patrons) => {
            if (patrons.length > 0) {
              res.render('new_loan', { 
                loan: Loan.build(), 
                books: books, 
                patrons: patrons, 
                today: today,
                return_date: returnDate }
              )
            } else { // there are no patrons!
              res.render('error_message', { message: 'There are no patrons in the library database. Please enter a patron before taking out a book.'});        
            }
          })
        } else { // there are no books that are available to check out!
          res.render('error_message', { message: 'There are no books that are available to check out in the library database.'});
        }
    })
  })  
});

/* POST new loan info */
router.post('/new_loan.html', function(req, res, next) {
  
  Loan.create(req.body)
  .then((loan) => {
    loan.setBook(req.body.book_id);
    loan.setPatron(req.body.patron_id);
    res.redirect('/');
  })
  .catch((error) => {
    if (error.name === "SequelizeValidationError") {
      res.render('new_loan', { loan: Loan.build(req.body), errors: error.errors });
    } else { throw error; }
  }).catch((error) => console.log('error', error));
});

/* GET all loans page. */
router.get('/all_loans.html', function(req, res, next) {

  Loan.findAll({
    include: [
      {
        model: Book
      },
      {
        model: Patron
      }
    ]
  })
  .then((loans) => {
    const formattedLoans = loans.map((loan) => {
      return {
        book_title: loan.dataValues.Book.dataValues.title,
        patron: `${loan.dataValues.Patron.dataValues.first_name} ${loan.dataValues.Patron.dataValues.last_name}`,
        book_id: loan.dataValues.book_id,
        patron_id: loan.dataValues.patron_id,
        loaned_on: formatDate(loan.dataValues.loaned_on),
        return_by: formatDate(loan.dataValues.return_by),
        returned_on: formatDate(loan.dataValues.returned_on)
      }

    });
    res.render('all_loans', { loans: formattedLoans, title: 'All Loans' })
  });
});

/* GET overdue loans page. */
router.get('/overdue_loans.html', function(req, res, next) {

  const today = new Date();
  // let book_ids =[];

  Loan.findAll( 
    { where: 
      { return_by: {[Op.lt]: today }, 
      returned_on: {[Op.eq]: null} 
      },
      include: [
        {
          model: Book
        },
        {
          model: Patron
        }
    ]})
  .then((loans) => {
    const formattedLoans = loans.map((loan) => {
      return {
        book_title: loan.dataValues.Book.dataValues.title,
        patron: `${loan.dataValues.Patron.dataValues.first_name} ${loan.dataValues.Patron.dataValues.last_name}`,
        book_id: loan.dataValues.book_id,
        patron_id: loan.dataValues.patron_id,
        loaned_on: formatDate(loan.dataValues.loaned_on),
        return_by: formatDate(loan.dataValues.return_by),
        returned_on: formatDate(loan.dataValues.returned_on)
      }
    });
    res.render('overdue_loans', { loans: formattedLoans, title: 'Overdue Loans' })
  });
});

/* GET checked loans page. */
router.get('/checked_loans.html', function(req, res, next) {

  Loan.findAll( 
    { where: 
      { loaned_on: {[Op.not]: null}, // test for empty cell
      returned_on: null}, 
      include: [
        {
          model: Book
        },
        {
          model: Patron
        }
    ]})
  .then((loans) => {
    const formattedLoans = loans.map((loan) => {
      return {
        book_title: loan.dataValues.Book.dataValues.title,
        patron: `${loan.dataValues.Patron.dataValues.first_name} ${loan.dataValues.Patron.dataValues.last_name}`,
        book_id: loan.dataValues.book_id,
        patron_id: loan.dataValues.patron_id,
        loaned_on: formatDate(loan.dataValues.loaned_on),
        return_by: formatDate(loan.dataValues.return_by),
        returned_on: formatDate(loan.dataValues.returned_on)
      }
    });
    res.render('checked_loans', { loans: formattedLoans, title: 'Checked Out Books' })
  });
});

module.exports = router;
