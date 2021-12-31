const router = require("express").Router();
const { Op } = require("sequelize");
const { Conversation, Message } = require("../../db/models");
const onlineUsers = require("../../onlineUsers");

// expects {header, recipientId, text, conversationId } in body (conversationId will be null if no conversation exists yet)
router.post("/", async (req, res, next) => {
  try {
    if (!req.user) {
      return res.sendStatus(401);
    }
    const senderId = req.user.id;
    const { header, recipientId, text, conversationId, sender } = req.body;

    switch(header){
      case 'READ_RECIEPT':
        // if this convo doesn't exist yet, then we don't want to send a read reciept here
        if (!conversationId) return res.sendStatus(201);

        const querySchema = {
          where: {
            header: {
              [Op.eq]: 'READ_RECIEPT'
            },
            senderId: {
              [Op.eq]: senderId
            },
            conversationId: {
              [Op.eq]: conversationId
            },
          }
        }

        // we want to check if there's already a reciept for this user in the convo. 
        // if so, we only want to update it, not create it

        const existingReciept = await Message.findOne(querySchema);

        if (existingReciept) {
          const message = await Message.update(
            {text: ''},
            {
              ...querySchema,
              returning: true,
              plain: false
            },
          );
          return res.json({ message, sender });
        } else {
          const message = await Message.create({ header, senderId, text, conversationId });
          return res.json({ message, sender });
        }

      case 'MESSAGE':
        // if we already know conversation id, we can save time and just add it to message and return
        if (conversationId) {
          const message = await Message.create({ header, senderId, text, conversationId });
          return res.json({ message, sender });
        } 
        
        // if we don't have conversation id, find a conversation to make sure it doesn't already exist
        let conversation = await Conversation.findConversation(
          senderId,
          recipientId
        );

        if (!conversation) {
          // create conversation
          conversation = await Conversation.create({
            user1Id: senderId,
            user2Id: recipientId,
          });
          if (onlineUsers.includes(sender.id)) {
            sender.online = true;
          }
        }
        const message = await Message.create({
          header,
          senderId,
          text,
          conversationId: conversation.id,
        });
        res.json({ message, sender });

        }
  } catch (error) {
    next(error);
  }
});

module.exports = router;
