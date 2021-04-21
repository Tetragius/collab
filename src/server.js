const express = require('express');
const cors = require('cors')
const app = express();
const path = require('path');
const server = require('http').createServer(app);
const io = require('socket.io')(server, {
    cors: {
        origin: "http://localhost:8080",
    },
});
const port = process.env.PORT || 3000;

server.listen(port, () => {
    console.log('Server listening at port %d', port);
});

app.use(cors())
app.use(express.static(path.join(__dirname, 'public')));

const rooms = {};

const getColor = () => parseInt((Math.random() * 10000000)).toString(16);
const getId = () => Math.random().toString(8)

io.on('connection', (socket) => {

    const roomId = socket.handshake.auth.roomId ?? getId();
    const userId = getId();

    room = rooms[roomId] ?? {
        users: [],
        content: ''
    };

    if (!rooms[roomId]) {
        rooms[roomId] = room;
    }

    const user = { id: userId, color: getColor() };

    socket.join(roomId);

    socket.emit('accept', {
        room,
        roomId,
        userId
    });

    room.users.push(user);

    socket.to(roomId).emit('user', user);

    socket.on('message', ({ content, from, to }) => {
        room.content = content.value;
        socket.to(to).emit('message', {
            from: from,
            message: content
        });
    });

});