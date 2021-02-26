const express = require('express');
const socketio = require('socket.io');
const http = require('http');
const cors = require('cors');
const PORT = process.env.PORT || 5000;
const router = require('./router');

const {addUser, removeUser, getUser, getUsersInRoom} = require('./users');

const app = express();


const server = http.createServer(app);
// Allow cors to every origin
const io = socketio(server, {cors : {origin : "*"}});

io.on('connect', (socket) => {
    socket.on('join', ({ name, room }, callback) => {
        const { error, user } = addUser({ id: socket.id, name, room });
        // Callback gives us a response right after an emit
        if(error) return callback(error);

        // Send message to the user
        socket.emit('message', { user: 'admin', text: `${user.name}, Welcome to room ${user.room}` });
        // Send message to everyone in the room except the user
        socket.broadcast.to(user.room).emit('message', { user: 'admin', text: `${user.name}, has joined!` });

        socket.join(user.room);

        io.to(user.room).emit('roomData', {room: user.room, users: getUsersInRoom(user.room)});

        callback();

    });

    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id);
        // Send message to everyone including him
        io.to(user.room).emit('message', {user: user.name, text: message});
        // Do somthing after in the frontend
        callback();
    });

    socket.on('disconnect', () => {
        const user = removeUser(socket.id);

        if(user) {
            io.to(user.room).emit('message', {user: 'admin', text: `${user.name} has left`});
            io.to(user.room).emit('roomData', {room: user.room, users: getUsersInRoom(user.room)});
        }
    });
});

app.use(cors);
app.use(router);


server.listen(PORT, () => console.log(`Server has started on port ${PORT}`));
