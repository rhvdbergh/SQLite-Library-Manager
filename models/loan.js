'use strict';
module.exports = (sequelize, DataTypes) => {
  var Loan = sequelize.define('Loan', {
    book_id: DataTypes.INTEGER,
    patron_id: DataTypes.INTEGER,
    loaned_on: DataTypes.DATE,
    return_by: DataTypes.DATE,
    returned_on: DataTypes.DATE
  }, {timestamps: false});
  Loan.associate = function(models) {
    // associations can be defined here
  };
  return Loan;
};