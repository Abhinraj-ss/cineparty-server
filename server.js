const express = require('express');
const app = express();
const PORT = process.env.PORT|| 4000;
const http = require('http').Server(app);
const cors = require('cors');

let users = [];

app.use(cors());

const socketIO = require('socket.io')(http, {
  cors: {
      origin: ["http://localhost:3000","https://cineparty.netlify.app"]
  }
});



socketIO.on('connection', (socket) => {
  console.log(`⚡: ${socket.id} user just connected!`);
  socket.on('message', (data) => {
    socketIO.emit('messageResponse', data);
  });

  socket.on('typing', (data) => socket.broadcast.emit('typingResponse', data));
  socket.on('link', (data) =>socket.broadcast.emit('link', data));

  socket.on('play/pause',(data)=>socket.broadcast.emit('command',data))
  
  //Listens when a new user joins the server
  socket.on('newUser', (data) => {
    //Adds the new user to the list of users
    users.push(data);
    // console.log(users);
    //Sends the list of users to the client
    socketIO.emit('newUserResponse', users);
  });

  socket.on('disconnect', () => {
    console.log('🔥: A user disconnected');
    //Updates the list of users when a user disconnects from the server
    users = users.filter((user) => user.socketID !== socket.id);
    // console.log(users);
    //Sends the list of users to the client
    socketIO.emit('newUserResponse', users);
    socket.disconnect();
  });
});

app.get('/api', (req, res) => {
  res.json({
    message: 'Hello world',
  });
});

http.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});