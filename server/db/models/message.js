const Sequelize = require("sequelize");
const db = require("../db");

const Message = db.define("message", {
  header: {
    type: Sequelize.ENUM('MESSAGE', 'READ_RECEIPT'),
    defaultValue: 'MESSAGE',
    allowNull: false
  },
  text: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  senderId: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
});

module.exports = Message;
