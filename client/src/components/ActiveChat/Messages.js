import React from "react";
import { Box } from "@material-ui/core";
import { SenderBubble, OtherUserBubble } from "../ActiveChat";
import moment from "moment";

const Messages = (props) => {
  const { messages, otherUser, userId } = props;

  return (
    <Box>
      {messages.map((message) => {
        switch(message.header){
          default:
            const time = moment(message.createdAt).format("h:mm");
            return message.senderId === userId ? (
              <SenderBubble key={message.id} text={message.text} time={time} />
            ) : (
              <OtherUserBubble key={message.id} text={message.text} time={time} otherUser={otherUser} />
            );
          case 'READ_RECIEPT':
            const updatedTime = moment(message.updatedAt).format("h:mm");
            return message.senderId === userId ? (
              <></>
            ) : (
              <p key={message.id}>Seen at: {updatedTime}</p>
            );
        }
      })}
    </Box>
  );
};

export default Messages;
