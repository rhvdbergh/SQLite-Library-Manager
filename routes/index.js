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

// tests for a date in the format yyyy-mm-dd
function isValidDate(date) {

  // regEx tests for years between 1900-2199 (1900 in case of old entries)
  // as well as two digits for months and two digits for days
  let regEx = /^(19|20|21)\d\d-\d{2}-\d{2}$/; 
  let year = date.substring(0,4);
  let month = date.substring(5, 7);
  let day = date.substring(8,10);
 
  if (month < 1) return false;
  if (month > 12) return false;
  if (day < 1) return false;
  

  if (['01', '03', '05', '07', '08', '10', '12'].includes(month)) {
    if (day > 31) return false;
  }

  if (['04', '06', '09', '11'].includes(month)) {
    if (day > 30) return false;
  }

  if (month === '02') { // February needs to be checked for leap years
    if (year % 4 === 0) { // it is a leap year
      if (day > 29) return false;
    } else if (day > 28) return false;
  }
  
  // make sure that the year falls within range and that the months
  // and days are two digits
  // if so, the date is valid at this point
  if (regEx.test(date)) return true;
  return false;
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
        res.render('new_book', { book: Book.build(req.body), errors: error.errors, button_message: 'Create New Book' });
      } else { throw error; }
    }).catch((error) => console.log('error', error));
  
});

/* GET all books page. */
router.get('/all_books.html', function(req, res, next) {

  Book.findAll()
    .then((books) => res.render('all_books', { books: books, title: "Books" }));
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
  
  Loan.findAll({
      where: 
    {book_id: req.params.id},
    include: [
      {
        model: Book
      },
      {
        model: Patron
      }]
    })
  .then((loans) => {
    if (loans.length > 0) {
      const formattedLoans = loans.map((loan) => {
        return {
          book: loan.dataValues.Book,
          book_title: loan.dataValues.Book.dataValues.title,
          patron_name: `${loan.dataValues.Patron.dataValues.first_name} ${loan.dataValues.Patron.dataValues.last_name}`,
          book_id: loan.dataValues.book_id,
          patron_id: loan.dataValues.patron_id,
          loaned_on: formatDate(loan.dataValues.loaned_on),
          return_by: formatDate(loan.dataValues.return_by),
          returned_on: formatDate(loan.dataValues.returned_on)
        }
      });
      res.render('book_detail', { loans: formattedLoans, book: formattedLoans[0].book, title: formattedLoans[0].book.dataValues.title, button_message: 'Update' })
    } else {
      Book.findById(req.params.id)
      .then((book) => {
        const formattedLoans = [];
        res.render('book_detail', { loans: formattedLoans, book: book, title: book.dataValues.title, button_message: 'Update' })
      });
    } 
    }
  );
});

/* POST edit book page. */
router.post('/book/:id', function(req, res, next) {
  Book.findById(req.params.id) 
  .then((book) => {
    book.update(req.body)
  })
  .then(() => res.redirect('/'));
});

/* GET return book page. */
router.get('/return/:id', function(req, res, next) { 

  Loan.findAll({
        where: 
          { book_id: req.params.id,
            returned_on: {[Op.eq]: null} },
        include: [
        {
          model: Book
        },
        {
          model: Patron
        }]
      })
    .then((loans) => {
      const formattedLoans = loans.map((loan) => {
        return {
          today: formatDate(new Date()),
          book_title: loan.dataValues.Book.dataValues.title,
          patron_name: `${loan.dataValues.Patron.dataValues.first_name} ${loan.dataValues.Patron.dataValues.last_name}`,
          loaned_on: formatDate(loan.dataValues.loaned_on),
          return_by: formatDate(loan.dataValues.return_by),
        }
      })
      return formattedLoans; // there should be only one, but if not, the first will be returned by [0]
    })
    .then((loan) => {
      res.render('return_book', { loan: loan[0] })
    });
});

/* POST return book page. */
router.post('/return/:id', function(req, res, next) { 

  Loan.findAll({
    where: 
      { book_id: req.params.id,
        returned_on: {[Op.eq]: null} }
  })
  .then((loan) => {
    const date = req.body.returned_on; 
    // because r.b.returned_on is returned as a string in the format yyyy-mm-dd 
    // we have to create a new Date -- otherwise date displays wrong in SQL
    // because it is based on time zone 
    const returned_on = new Date(date.substring(0,4), date.substring(5, 7)-1, date.substring(8, 10));
    loan[0].updateAttributes({returned_on: returned_on });
  })
  .then(() => res.redirect('/'));
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
  
  res.render('new_patron', { patron: Patron.build(), title: 'New Patron', button_message: 'Create New Patron' });
});

/* POST new patrons info */
router.post('/new_patron.html', function(req, res, next) {
  
  Patron.create(req.body)
  .then(() => {
    res.redirect('all_patrons.html');
  })
  .catch((error) => {
    if (error.name === "SequelizeValidationError") {
      res.render('new_patron', { patron: Patron.build(req.body), errors: error.errors, button_message: 'Create New Patron' });
    } else { throw error; }
  }).catch((error) => console.log('error', error));
});

/* GET edit patron page. */
router.get('/patron/:id', function(req, res, next) {
  
  Loan.findAll({
      where: { patron_id: req.params.id},
      include: [
        {
          model: Book
        },
        {
          model: Patron
        }]
      })
  .then((loans) => {
    if (loans.length > 0) {
      const formattedLoans = loans.map((loan) => {
        return {
          patron: loan.dataValues.Patron,
          book_title: loan.dataValues.Book.dataValues.title,
          patron_name: `${loan.dataValues.Patron.dataValues.first_name} ${loan.dataValues.Patron.dataValues.last_name}`,
          book_id: loan.dataValues.book_id,
          patron_id: loan.dataValues.patron_id,
          loaned_on: formatDate(loan.dataValues.loaned_on),
          return_by: formatDate(loan.dataValues.return_by),
          returned_on: formatDate(loan.dataValues.returned_on)
          }
        });
        res.render('patron_detail', { loans: formattedLoans, patron: formattedLoans[0].patron, title: formattedLoans[0].patron_name, button_message: 'Update' })
      } else {
        Patron.findById(req.params.id)
        .then((patron) => {
          const formattedLoans = [];
          const patron_name = `${patron.first_name} ${patron.last_name}`;
        res.render('patron_detail', { loans: formattedLoans, patron: patron, title: patron_name, button_message: 'Update' })
        });
      }
    }
  );
});

/* POST edit patron page. */
router.post('/patron/:id', function(req, res, next) { 

  Patron.findById(req.params.id) 
  .then((patron) => {
    patron.update(req.body);
  })
  .then(() => res.redirect('/'));
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
  });  
});

/* POST new loan info */
router.post('/new_loan.html', function(req, res, next) {
  
  if (!isValidDate(req.body.loaned_on)) { // not a valid date
    let error = [
      { message: 'Please enter a validate date for the "Loaned on" field.' }
    ];
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
                  today: req.body.loaned_on, // keep the date submitted by the user
                  return_date: req.body.return_by,  // keep the date submitted by the user
                  errors: error }
                )
              } else { // there are no patrons!
                res.render('error_message', { message: 'There are no patrons in the library database. Please enter a patron before taking out a book.'});        
              }
            })
          } else { // there are no books that are available to check out!
            res.render('error_message', { message: 'There are no books that are available to check out in the library database.'});
          }
      })
    });
    } else { // end error validation

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
} // end else
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
        patron_name: `${loan.dataValues.Patron.dataValues.first_name} ${loan.dataValues.Patron.dataValues.last_name}`,
        book_id: loan.dataValues.book_id,
        patron_id: loan.dataValues.patron_id,
        loaned_on: formatDate(loan.dataValues.loaned_on),
        return_by: formatDate(loan.dataValues.return_by),
        returned_on: formatDate(loan.dataValues.returned_on)
      }

    });
    res.render('all_loans', { loans: formattedLoans, title: 'Loans' })
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
        patron_name: `${loan.dataValues.Patron.dataValues.first_name} ${loan.dataValues.Patron.dataValues.last_name}`,
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
        patron_name: `${loan.dataValues.Patron.dataValues.first_name} ${loan.dataValues.Patron.dataValues.last_name}`,
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
