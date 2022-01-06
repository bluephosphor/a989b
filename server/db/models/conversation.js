const { Sequelize, DataTypes } = require("sequelize");
const db = require("../db");
const Message = require("./message");

const Conversation = db.define("conversation", {});

// an example of how we could query conversations in this new format
Conversation.findConvosByUser = async function(userId, convoId){
	const conversations = await UsersConvos.findAll({
		where: {
			userId: userId,
			conversationId: convoId
		}
	});
	return conversations;
};

module.exports = Conversation; 