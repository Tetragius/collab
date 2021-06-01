const express = require('express');
const cors = require('cors')
const app = express();
const path = require('path');
const { reduceEachLeadingCommentRange } = require('typescript');
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

    console.log(socket.handshake.auth);
    const roomId = socket.handshake.auth.roomId ?? getId();
    const userId = getId();
    const userName = socket.handshake.auth.name;

    if (socket.handshake.auth.roomId && !rooms[roomId]) {
        socket.emit('decline', { msg: 'Неверный ID комнаты' });
        return;
    }

    room = rooms[roomId] ?? {
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
        room.content = content.value;
        socket.to(to).emit('message', {
            from: from,
            message: content
        });
    });

});