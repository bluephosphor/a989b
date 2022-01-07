import React from "react";
import { makeStyles } from "@material-ui/styles";
import { Avatar, Box } from "@material-ui/core";
import { SenderBubble, OtherUserBubble } from "../ActiveChat";
import moment from "moment";

const useStyles = makeStyles(() => ({
  readBox:{
    display: 'flex',
    justifyContent: 'flex-end'
  },
  readBubble: {
    width:  '20px',
    height: '20px',
  }
}));

const Messages = (props) => {
  const { messages, otherUser, userId } = props;
  const classes = useStyles();
  return (
    <Box>
      {messages.map((message) => {
        switch(message.header){
          case 'READ_RECEIPT':
            return message.senderId !== userId && (
              <Box className={classes.readBox}>
                <Avatar className={classes.readBubble} alt={otherUser.username} key={message.id} src={otherUser.photoUrl}/>
              </Box>
            );
          default:
            const time = moment(message.createdAt).format("h:mm");
            return message.senderId === userId ? (
              <SenderBubble key={message.id} text={message.text} time={time} />
            ) : (
              <OtherUserBubble key={message.id} text={message.text} time={time} otherUser={otherUser} />
            );
        }
      })}
    </Box>
  );
};

export default Messages;
