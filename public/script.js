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

    // ######## ANSWER #########
    // Add video stream from User B
    peer.on('call', call => {
        call.answer(stream)
        const video = document.createElement('video')
        call.on('stream', userVideoStream => {
          addVideoStream(video, userVideoStream)
        })
      })

    // Whenever a new user connects
    socket.on('user-connected', (userId) => {
        connecToNewUser(userId, stream);
    })

    // JQuery
    let text = $('input')

    // Send message when ENTER key is pressed but only when char is > 1
    $('html').keydown((e) => {
        if (e.which == 13 && text.val().length !== 0) {
            console.log(text.val())
            // Send message from Frontend
            socket.emit('message', text.val());
            text.val('')
        }
    });

    // Received the message
    socket.on('createMessage', message => {
        // Send the message as a list item back to the UI
        $('.messages').append(`<li class="message"><b>user</b><br/>${message}></li>`)
        console.log('This is coming from server ', message)
    })
})

peer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id);
    console.log(id);
})
socket.emit('join-room', ROOM_ID); // The ROOM_ID is coming from room.ejs > const ROOM_ID

// ######## CALL #########
// When user B connects and user A is already present...
const connecToNewUser = (userId, stream) => {
    // User A calls User B
    const call = peer.call(userId, stream)
    // Create new video element for purposes of sending to user B
    const video = document.createElement('video')
    // Send user B the stream
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream)
    })

    console.log(userId, ' new user');
}

const addVideoStream = (video, stream) => {
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
        video.play();
    });
    videoGrid.append(video);
}

// Always scroll to the bottom as new chat messages come in
const scrollToBottom = () => {
    var d = $('.main__chat_window');
    d.scrollTop(d.prop("scrollHeight"));
}

// Mute and unMute the Microphone
const muteUnmute = () => {
    const enabled = myVideoStream.getAudioTracks()[0].enabled;
    if (enabled) {
      myVideoStream.getAudioTracks()[0].enabled = false;
      setUnmuteButton();
    } else {
      setMuteButton();
      myVideoStream.getAudioTracks()[0].enabled = true;
    }
  }

const setMuteButton = () => {
    const html = `
    <i class="fas fa-microphone"></i>
    <span>Mute</span>
`
    document.querySelector('.main__mute_button').innerHTML = html;
}
  
const setUnmuteButton = () => {
    const html = `
    <i class="unmute fas fa-microphone-slash"></i>
    <span>Unmute</span>
`
    document.querySelector('.main__mute_button').innerHTML = html;
}

const playStop = () => {
    console.log('object')
    let enabled = myVideoStream.getVideoTracks()[0].enabled;
    if (enabled) {
      myVideoStream.getVideoTracks()[0].enabled = false;
      setPlayVideo()
    } else {
      setStopVideo()
      myVideoStream.getVideoTracks()[0].enabled = true;
    }
}

const setPlayVideo = () => {
    const html = `
    <i class="stop fas fa-video-slash"></i>
      <span>Play Video</span>
    `
    document.querySelector('.main__video_button').innerHTML = html;
}

const setStopVideo = () => {
    const html = `
      <i class="fas fa-video"></i>
      <span>Stop Video</span>
    `
    document.querySelector('.main__video_button').innerHTML = html;
}