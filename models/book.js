'use strict';
module.exports = (sequelize, DataTypes) => {
  var Book = sequelize.define('Book', {
    title: { 
      type: DataTypes.STRING,
      validate: {notEmpty: {msg: 'Title required'}}
    },
    author: { 
      type: DataTypes.STRING,
      validate: {notEmpty: {msg: 'Author required'}}
    },
    genre: {
      type: DataTypes.STRING,
      validate: {notEmpty: {msg: 'Genre required'}}
    },
    first_published: DataTypes.INTEGER
  }, {timestamps: false});
  Book.associate = function(models) {
    // associations can be defined here
  };
  return Book;
};