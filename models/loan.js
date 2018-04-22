'use strict';
module.exports = (sequelize, DataTypes) => {
  var Loan = sequelize.define('Loan', {
    loaned_on: {
      type: DataTypes.DATE,
      validate: {isDate: {msg: 'Loaned on date is required in the form yyyy-mm-dd.'}}
    },
    return_by: DataTypes.DATE,
    returned_on: {
      type: DataTypes.DATE,
      validate: {isDate: {msg: 'Returned on date is required in the form yyyy-mm-dd.'}}
    }
  }, {timestamps: false, underscored: true});
  Loan.associate = function(models) {
    // associations can be defined here
    Loan.belongsTo(models.Patron);
    Loan.belongsTo(models.Book);
  };
  return Loan;
};