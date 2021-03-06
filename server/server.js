const express = require('express');
const cors = require('cors')
const app = express();
const path = require('path');

const server = require('http').createServer(app);
const io = require('socket.io')(server, {
    cors: {
        origin: "*",
    },
});
const port = 8080;

app.use(express.static('public'));

server.listen(port, () => {
    console.log('Server listening at port %d', port);
});

app.use(cors())
app.use(express.static(path.join(__dirname, 'public')));

const rooms = {};
const dayMS = 1000 * 60 * 60 * 24;

setInterval(() => {
    const now = Date.now();
    Object.keys(rooms).forEach(key => {
        if (rooms[key].createdOn + dayMS < now) {
            delete rooms[key];
        }
    })
}, dayMS);

const getColor = () => parseInt((Math.random() * 10000000)).toString(16);
const getId = () => {
    const id = Math.random().toString(8);
    if (Object.keys(rooms).includes(id)) {
        return getId();
    }
    return id;
}

io.on('connection', (socket) => {

    const roomId = socket.handshake.auth.roomId ?? getId();
    const userId = getId();
    const userName = socket.handshake.auth.name;

    if (socket.handshake.auth.roomId && !rooms[roomId]) {
        socket.emit('decline', { msg: 'Неверный ID комнаты' });
        return;
    }

    room = rooms[roomId] ?? {
        createdOn: Date.now(),
        users: [],
        pwd: socket.handshake.auth.pwd,
        content: `import React from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';

const Box = styled.div\`
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    color: red;
    font-size: 48pt;
\`;

const App = () => <Box>Test</Box>;

ReactDOM.render(<App />, document.getElementById('app'));
`
    };

    if (socket.handshake.auth.pwd !== room.pwd) {
        socket.emit('decline', { msg: 'Неверный пароль' });
        return;
    }

    if (!rooms[roomId]) {
        rooms[roomId] = room;
    }

    const user = { id: userId, name: userName, color: getColor() };

    socket.join(roomId);

    socket.emit('accept', {
        room,
        roomId,
        userId
    });

    room.users.push(user);

    socket.to(roomId).emit('user', user);

    socket.on('message', ({ content, from, to }) => {
        room.content = content.value ?? room.content;
        socket.to(to).emit('message', {
            from: from,
            message: content
        });
    });

    socket.on('leave', ({ content, from, to }) => {

        const room = rooms[to];
        if (room) {
            const idx = room.users.findIndex(u => u.id === from);
            room.users[idx] = false;
            room.users = room.users.filter(Boolean);

            if (!room.users.length) {
                delete rooms[to];
            }
        }

        socket.to(to).emit('userLeave', {
            from: from,
            userId: from
        });
    });

});