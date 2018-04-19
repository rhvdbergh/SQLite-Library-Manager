'use strict';



module.exports = (sequelize, DataTypes) => {
  var Book = sequelize.define('Book', {
    title: { 
      type: DataTypes.STRING,
      validate: {notEmpty: {msg: 'Title required'}},
      unique: false
    },
    author: { 
      type: DataTypes.STRING,
      validate: {notEmpty: {msg: 'Author required'}}
    },
    genre: {
      type: DataTypes.STRING,
      validate: {notEmpty: {msg: 'Genre required'}}
    },
    first_published: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
      validate: {is: {
        args: /(^(15|16|17|18|19|20)\d\d$)|^$/, // four number date within range 1500-2099 or empty string
        msg: 'First published should either be empty or contain a date between 1500-2099'
      }
    } 
    }
  }, {timestamps: false, underscored: true});
  Book.associate = function(models) {
    // associations can be defined here
    // Book.belongsTo(models.Loan);
  };
  return Book;
};