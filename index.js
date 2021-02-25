const express = require('express');
const socketio = require('socket.io');
const http = require('http');
const cors = require('cors');

const PORT = process.env.PORT || 5000;

const router = require('./router');

const app = express();


const server = http.createServer(app);
// Allow cors to every origin
const io = socketio(server, {cors : {origin : "*"}});

io.on('connect', (socket) => {
    console.log('New Connection');

    socket.on('disconnect', () => {
        console.log('User Left');
    });
});

app.use(cors);
app.use(router);


server.listen(PORT, () => console.log(`Server has started on port ${PORT}`));
