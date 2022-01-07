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

    const handleReceipt = async (convoId) => {
      // we want to check if there's already a receipt for this user in the convo. 
      // if so, we only want to update it, not create it
      const existingReceipt = await Message.update(
        {text: ''},
        {
          returning: true,
          plain: false,
          where: {
            header: 'READ_RECEIPT',
            senderId: senderId,
            conversationId: convoId,
          },
        }
      );
      if (existingReceipt){
        const [ rowsUpdate, [updatedMessage] ] = existingReceipt; 
        if (updatedMessage) {
          return {...updatedMessage.dataValues, conversationId: convoId};
        } else {
          const message = await Message.create({ 
              header: 'READ_RECEIPT', 
              senderId, 
              text: '',
              conversationId: convoId
          });
          return message;
        }
      } else {
        const message = await Message.create({ 
            header: 'READ_RECEIPT', 
            senderId, 
            text: '',
            conversationId: convoId
        });
        return message;
      }
    }

    switch(header){
      case 'READ_RECEIPT':
        // if this convo doesn't exist yet, then we don't want to send a read receipt here
        if (!conversationId) return res.sendStatus(201);

        const result = await handleReceipt(conversationId);
        res.json({message: result, sender});
        
        break;
      case 'MESSAGE':
        
        // if we already know conversation id, we can save time and just add it to message and return
        if (conversationId) {
          const message = await Message.create({ header, senderId, text, conversationId });
          // create our read receipt to be sent along with the message
          const receipt = await handleReceipt(conversationId);
        
          return res.json({ message, sender, receipt });
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
        // create our read receipt to be sent along with the message
        const receipt = await handleReceipt(conversation.id);
        
        res.json({ message, sender, receipt: {...receipt, conversationId: conversation.id}});
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;
