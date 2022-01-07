const db = require("../db");
const Conversation = require("./conversation");
const User = require("./user");
const Message = require("./message");

//defining our join table so we can use it for queries later
const UsersConvos = db.define('Users_Convos');

// associations
User.belongsToMany(Conversation, {through: 'Users_Convos'});
Conversation.belongsToMany(User, {through: 'Users_Convos'});
Message.belongsTo(Conversation);
Conversation.hasMany(Message);

module.exports = {
  UsersConvos,
  User,
  Conversation,
  Message
};
