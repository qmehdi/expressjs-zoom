const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const { v4: uuidv4 } = require('uuid');

app.set('view engine', 'ejs');
app.use(express.static('public'));

// URLs
app.get('/', (req, res) => {
    res.redirect(`/${uuidv4()}`); // Generates a uuid and redirects to /<the uuid>
})

app.get('/:room', (req, res) => {
    res.render('room', { roomId: req.params.room });    
})

io.on('connection', socket => {
    // The user will join the room
    socket.on('join-room', (roomId) => {
        socket.join(roomId);
        console.log("Joined the room");
        
        // Tell everybody else inside the room that this user has connected
        socket.to(roomId).broadcast.emit('user-connected');
    })
})


server.listen(3030);
