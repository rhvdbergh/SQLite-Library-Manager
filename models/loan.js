'use strict';
module.exports = (sequelize, DataTypes) => {
  var Loan = sequelize.define('Loan', {
    book_id: DataTypes.INTEGER,
    patron_id: DataTypes.INTEGER,
    loaned_on: DataTypes.DATE,
    return_by: DataTypes.DATE,
    returned_on: DataTypes.DATE
  }, {timestamps: false, underscored: true});
  Loan.associate = function(models) {
    // associations can be defined here
    Loan.hasOne(models.Patron);
    Loan.hasOne(models.Book);
  };
  return Loan;
};