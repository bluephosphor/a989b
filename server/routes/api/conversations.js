const router = require("express").Router();
const { User, Conversation, Message } = require("../../db/models");
const { Op } = require("sequelize");
const onlineUsers = require("../../onlineUsers");

// get all conversations for a user, include latest message text for preview, and all messages
// include other user model so we have info on username/profile pic (don't include current user info)
router.get("/", async (req, res, next) => {
  try {
    if (!req.user) {
      return res.sendStatus(401);
    }
    const userId = req.user.id;
    const conversations = await Conversation.findAll({
      where: {
        [Op.or]: {
          user1Id: userId,
          user2Id: userId,
        },
      },
      attributes: ["id"],
      order: [[Message, "updatedAt", "ASC"]],
      include: [
        { model: Message, order: ["updatedAt", "ASC"] },
        {
          model: User,
          as: "user1",
          where: {
            id: {
              [Op.not]: userId,
            },
          },
          attributes: ["id", "username", "photoUrl"],
          required: false,
        },
        {
          model: User,
          as: "user2",
          where: {
            id: {
              [Op.not]: userId,
            },
          },
          attributes: ["id", "username", "photoUrl"],
          required: false,
        },
      ],
    });

    const updatedConvos = [];
    conversations.forEach((convo => {
        
      const convoJSON = convo.toJSON();

      // set a property "otherUser" so that frontend will have easier access
      if (convoJSON.user1) {
        convoJSON.otherUser = convoJSON.user1;
        delete convoJSON.user1;
      } else if (convoJSON.user2) {
        convoJSON.otherUser = convoJSON.user2;
        delete convoJSON.user2;
      }

      // set property for online status of the other user
      if (onlineUsers.includes(convoJSON.otherUser.id)) {
        convoJSON.otherUser.online = true;
      } else {
        convoJSON.otherUser.online = false;
      }

      // set properties for notification count and latest message preview
      const result = convoJSON.messages.reduce((accumulation, message) => {
        switch (message.header){
          case 'MESSAGE':
            return {
              lastMessage:        message.text,
              messageCount:       accumulation.messageCount + 1,
              notificationCount:  (accumulation.countFlag) ? accumulation.notificationCount + 1 : accumulation.notificationCount,
              countFlag:          accumulation.countFlag
            }
          case 'READ_RECEIPT':
            //start counting only after we've found our own read receipt
            if (!accumulation.countFlag) {
              return {
                lastMessage:        accumulation.lastMessage,
                messageCount:       accumulation.messageCount,
                notificationCount:  accumulation.notificationCount,
                countFlag: (message.senderId !== convoJSON.otherUser.id)
              }
            } else {
              return {
                lastMessage:        accumulation.lastMessage,
                messageCount:       accumulation.messageCount,
                notificationCount:  accumulation.notificationCount,
                countFlag: true
              }
            }
        }
      }, {lastMessage: '', messageCount: 0, notificationCount: 0, countFlag: false});

      // if we never found our read receipt then our unread count is all the convo messages
      if (!result.countFlag) result.notificationCount = result.messageCount;
      
      convoJSON.latestMessageText = result.lastMessage;
      convoJSON.notificationCount = result.notificationCount;
      updatedConvos.unshift(convoJSON);
    })) 

    res.json(updatedConvos);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
