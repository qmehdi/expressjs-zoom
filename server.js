const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const { v4: uuidv4 } = require('uuid');
const { ExpressPeerServer } = require('peer');
const peerServer = ExpressPeerServer(server, {
    debug: true
});

app.set('view engine', 'ejs');
app.use(express.static('public'));

app.use('/peerjs', peerServer);

// URLs
app.get('/', (req, res) => {
    res.redirect(`/${uuidv4()}`); // Generates a uuid and redirects to /<the uuid>
})

app.get('/:room', (req, res) => {
    res.render('room', { roomId: req.params.room });    
})

io.on('connection', socket => {
    // The user will join the room
    socket.on('join-room', (roomId, userId) => {
        socket.join(roomId);
        console.log("Joined the room");

        // Tell everybody else inside the room that this user has connected
        socket.to(roomId).broadcast.emit('user-connected', userId);

        // Listen for the message
        // When Enter is pressed in the Chat, this will receive it
        socket.on('message', message => {
            // Send message to only the specific room, not all rooms
            io.to(roomId).emit('createMessage', message)
        })

        socket.on('disconnect', () => {
            socket.to(roomId).broadcast.emit('user-disconnected', userId)
        })
    })
})


server.listen(process.env.PORT||3030);
