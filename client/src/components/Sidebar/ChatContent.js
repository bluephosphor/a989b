import React from "react";
import { Badge, Box, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    justifyContent: "space-between",
    marginLeft: 20,
    flexGrow: 1,
  },
  badge: {
    height: '20px',
    borderRadius: "50%",
    backgroundColor: "#3F92FF",
    color: "white",
    fontSize: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  username: {
    fontWeight: "bold",
    letterSpacing: -0.2,
  },
  previewText: {
    fontSize: 12,
    color: "#9CADC8",
    letterSpacing: -0.17,
  },
  previewTextNew: {
    fontWeight: 600,
    color: "#000"
  }
}));

const ChatContent = (props) => {
  const classes = useStyles();

  const { conversation } = props;
  const { latestMessageText, otherUser, notificationCount } = conversation;

  return (
    <Box className={classes.root}>
      <Box>
        <Typography className={classes.username}>
          {otherUser.username}
        </Typography>
        <Typography className={`${classes.previewText} ${classes[notificationCount > 0 && "previewTextNew"]}`}>
          {latestMessageText}
        </Typography>
      </Box>
        <Box>
          <Badge classes={{ badge: classes.badge }} badgeContent={notificationCount} />
        </Box>
    </Box>
  );
};

export default ChatContent;
