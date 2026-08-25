const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

const rooms = {};

io.on('connection', (socket) => {
    socket.on('create-room', (roomCode) => {
        rooms[roomCode] = { players: [socket.id], board: Array(9).fill(null), turn: 'X' };
        socket.join(roomCode);
        socket.emit('room-created', { roomCode, symbol: 'X' });
    });

    socket.on('join-room', (roomCode) => {
        if (rooms[roomCode] && rooms[roomCode].players.length === 1) {
            rooms[roomCode].players.push(socket.id);
            socket.join(roomCode);
            socket.emit('room-joined', { roomCode, symbol: 'O' });
            io.to(roomCode).emit('start-online-game', { turn: 'X' });
        } else {
            socket.emit('error-msg', 'Room full ya invalid hai!');
        }
    });

    socket.on('make-move', ({ roomCode, index, symbol }) => {
        if (rooms[roomCode]) {
            rooms[roomCode].board[index] = symbol;
            rooms[roomCode].turn = symbol === 'X' ? 'O' : 'X';
            io.to(roomCode).emit('move-made', { board: rooms[roomCode].board, turn: rooms[roomCode].turn });
        }
    });
});

server.listen(3000, () => {
    console.log('Multiplayer server running on port 3000');
});