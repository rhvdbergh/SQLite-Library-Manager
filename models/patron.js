'use strict';
module.exports = (sequelize, DataTypes) => {
  var Patron = sequelize.define('Patron', {
    first_name: {
      type: DataTypes.STRING,
      validate: {notEmpty: {msg: 'First name required'}}
    },
    last_name: {
      type: DataTypes.STRING,
      validate: {notEmpty: {msg: 'Last name required'}}
    },
    address: {
      type: DataTypes.STRING,
      validate: {notEmpty: {msg: 'Address required'}}
    },
    email: {
      type: DataTypes.STRING,
      validate: {is: {
        args: /.+\@.+\..+/, // RegEx to check for email
        msg: "Please enter a valid email address"
      }}
    },
    library_id: {
      type: DataTypes.STRING,
      validate: {notEmpty: {msg: 'Address required'}},
      unique: true
    },
    zip_code: {
      type: DataTypes.STRING,
      validate: {is: {
        args: /^\d{5}$/, // RegEx to check for 5 digits
        msg: "Please enter a zip code consisting of 5 digits"
      }}
    }
  }, {timestamps: false, underscored: true});
  Patron.associate = function(models) {
    // associations can be defined here
    // Patron.belongsTo(models.Loan);
  };
  return Patron;
};