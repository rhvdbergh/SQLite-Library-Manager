# SQLite-Library-Manager
Treehouse Techdegree Project 10: Library Manager using Express, Pug, SQLite3 and Sequelize ORM

## How to install
- On the command line, run `npm install`
- On the command line, run `node npm start`
- Point a browser to `localhost:3000`

## Treehouse Instructions: 
You've been tasked with creating a library management system for a small library. The librarian has been using a simple sqlite database and has been entering data in manually. The librarian wants a more intuitive way to handle the library's books, patrons and loans.

You'll be given static HTML designs, a set of requirements and the existing SQLite database. You'll be required to implement a dynamic website using Express, Pug, and the SQL ORM Sequelize.

## Grade attempt
I am aiming for an "exceeds expectations grade" for this project. There are two requirements for exceeds:
- Pagination for loans and book listing pages
- Search fields on at least one of the books or patrons listing pages. Searching will not be case sensitive and results will include partial matches.

## App sketch
-There are three tables, `books`, `patrons`, and `loans`
- `books` has columns: `id`=integer, `title`=string, `author`=string, `genre`=string, `first_published`=integer
- `patrons` has columns: `id`=integer, `first_name`=string, `last_name`=string, `address`=string, `email`=string, `library_id`=string,, `zip_code`=integer
- `loans` has columns: `id`=integer, `book_id`=integer, `patron_id`=integer, `loaned_on`=date, `return_by`=date, `returned_on`=date
- Home screen (as in example home.html) with links to following: 
  - Books:
    - New Book
    - List All
    - List Overdue
    - List Checked Out
  - Patrons:
    - New Patron
    - List All
  - Loans
    - New Loan
    - List All
    - List Overdue
    - List Checked Out
- Main nav menu from every page
  - Links to `all_books.html`, `all_patrons.html`, `all_loans.html`
- Books listing page
  - Filter by "overdue" and "checked out"
- Add book page
  - Fields for input are `title`, `author`, and `genre`, optional `first_published`
  - Form should validate input
  - Redirect to Books Listing Page (and new book should appear in list)
- Book Deatail Page
  - Able to make edits, view loan history
  - Links to return checked out or overdue books, each patron in the loan history
- Loan listing page
  - Filter by "All", "Overdue", and "Checked Out"
  - Links to return checked out or overdue books, each book in loan history, each patron in loan history
- New Loan Page
  - Able to check out book
  - "Patron" and "book" fields are `select` boxes to select `patron_id` or `book_id`
  - `loaned_on` field should autopopulate with today's date, format yyyy-mm-dd
  - return by date autopopulated with today's date + 7 days
  - Required fields: `book_id`, `patron_id`, `loaned_on`, `return_by`, not required `returned_on`
- Return Book Page
  - only field `returned_on`, required
  - should autopopulate with today's date
- Patron Listing Page
  - list all patorns
  - links to each patron detail page
- Patron Detail Page
  - Able to make edits and view loan history
  - Links to return checked out or overdue books, each book in the loan history
- New Patron Page
  - Able to create new patrons
  - Required fields: `first_name`, `last_name`, `address`, `email`, `library_id`, `zip_code`
- If required fields are empty, feedback should be given so the data can be corrected
