export const addMessageToStore = (state, payload) => {
  const { message, receipt, sender } = payload;
  // if sender isn't null, that means the message needs to be put in a brand new convo
  if (sender !== null) {
    const newConvo = {
      id: message.conversationId,
      otherUser: sender,
      messages: [message],
      latestMessageText: message.text,
      notificationCount: 1
    };
    return [...state, newConvo];
  }
  
  return state.map((convo) => {
    if (convo.id === message.conversationId) {
      const convoCopy = { ...convo };
      
      if (message.header === 'MESSAGE') {
        convoCopy.latestMessageText = message.text;
        convoCopy.notificationCount = convoCopy.notificationCount + 1;
        convoCopy.messages = [...convoCopy.messages, message];
        if (receipt) {
          convoCopy.messages = convoCopy.messages.filter(msg => msg.header === 'MESSAGE');
          convoCopy.messages = [...convoCopy.messages,  receipt];
        }
      } else {
        convoCopy.messages = convoCopy.messages.filter(msg => msg.header === 'MESSAGE');
        convoCopy.messages = [...convoCopy.messages,  message];
      }
      
      return { ...convoCopy };
    } else {
      return convo;
    }
  });
};

export const addOnlineUserToStore = (state, id) => {
  return state.map((convo) => {
    if (convo.otherUser.id === id) {
      const convoCopy = { ...convo };
      convoCopy.otherUser = { ...convoCopy.otherUser, online: true };
      return convoCopy;
    } else {
      return convo;
    }
  });
};

export const removeOfflineUserFromStore = (state, id) => {
  return state.map((convo) => {
    if (convo.otherUser.id === id) {
      const convoCopy = { ...convo };
      convoCopy.otherUser = { ...convoCopy.otherUser, online: false };
      return convoCopy;
    } else {
      return convo;
    }
  });
};

export const addSearchedUsersToStore = (state, users) => {
  const currentUsers = {};

  // make table of current users so we can lookup faster
  state.forEach((convo) => {
    currentUsers[convo.otherUser.id] = true;
  });

  const newState = [...state];
  users.forEach((user) => {
    // only create a fake convo if we don't already have a convo with this user
    if (!currentUsers[user.id]) {
      let fakeConvo = { otherUser: user, messages: [] };
      newState.push(fakeConvo);
    }
  });

  return newState;
};

export const addNewConvoToStore = (state, recipientId, message) => {
  return state.map((convo) => {
    if (convo.otherUser.id === recipientId) {
      const convoCopy = { ...convo }
      convoCopy.id = message.conversationId;
      convoCopy.messages = [...convoCopy.messages, message];
      convoCopy.latestMessageText = message.text;
      return { ...convoCopy };
    } else {
      return convo;
    }
  });
};

export const updateUnreadCount = (state, payload) => {
  const { count, convoId } = payload;
  return state.map((convo) => {
    if (convo.id === convoId) {
      return { ...convo, notificationCount: count }
    } else {
      return convo;
    }
  });
};
