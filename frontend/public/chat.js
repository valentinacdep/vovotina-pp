document.addEventListener('DOMContentLoaded', () => {
  const socket = io('http://localhost:3000');

  const userList = document.getElementById('user-list');
  const currentUserDisplay = document.getElementById('current-user-display');
  const chatWindow = document.getElementById('chat-window');
  const chattingWith = document.getElementById('chatting-with');
  const messages = document.getElementById('messages');
  const messageForm = document.getElementById('message-form');
  const messageInput = document.getElementById('message-input');

  let currentUser = prompt('Digite seu nome de usuário:');
  let currentRecipient = null;

  currentUserDisplay.textContent = currentUser;
  socket.emit('authenticate', { id: currentUser, name: currentUser });

  socket.on('update-user-list', (users) => {
    userList.innerHTML = '';
    users.forEach(u => {
      if (u.id === currentUser) return;
      const li = document.createElement('li');
      li.textContent = u.name;
      li.onclick = () => {
        currentRecipient = u.id;
        chatWindow.classList.remove('hidden');
        chattingWith.textContent = u.name;
        messages.innerHTML = '';
        socket.emit('load-history', u.id);
      };
      userList.appendChild(li);
    });
  });

  socket.on('history', (history) => {
    messages.innerHTML = '';
    history.forEach(msg => {
      displayMessage(msg.senderName, msg.message, msg.senderName === currentUser);
    });
  });

  socket.on('private-message', ({ senderName, message }) => {
    displayMessage(senderName, message, senderName === currentUser);
  });

  messageForm.onsubmit = (e) => {
    e.preventDefault();
    if (!messageInput.value.trim() || !currentRecipient) return;
    socket.emit('private-message', {
      recipient: currentRecipient,
      message: messageInput.value,
      senderId: currentUser,
      senderName: currentUser
    });
    messageInput.value = '';
  };

  function displayMessage(sender, text, isMine) {
    const li = document.createElement('li');
    li.textContent = `${sender}: ${text}`;
    li.classList.add(isMine ? 'sent' : 'received');
    messages.appendChild(li);
    messages.scrollTop = messages.scrollHeight;
  }
});
