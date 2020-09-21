// This is where the JavaScript for the Frontend is going to live
const socket = io('/');

var peer = new Peer(undefined, {
    path: '/peerjs',
    host: '/',
    port: '3030'
});

// Create a video element and show our own video on the page
let myVideoStream;
const videoGrid = document.getElementById('video-grid');
const myVideo = document.createElement('video');
myVideo.muted = true;


// This is a promise. An event in the future that will be either resolved or rejected
navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream);
})

peer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id);
    console.log(id);
})
socket.emit('join-room', ROOM_ID); // The ROOM_ID is coming from room.ejs > const ROOM_ID

socket.on('user-connected', (userId) => {
    connecToNewUser(userId);
})

const connecToNewUser = (userId) => {
    console.log(userId, ' new user');
}

const addVideoStream = (video, stream) => {
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
        video.play();
    });
    videoGrid.append(video);
}
