// const socket = io();
// const createUserBtn = document.getElementById("create-user");
// const username = document.getElementById("username");
// const allusersHtml = document.getElementById("allusers");
// const localVideo = document.getElementById("localVideo");
// const remoteVideo = document.getElementById("remoteVideo");
// const endCallBtn = document.getElementById("end-call-btn")
//  let localStream;

// let caller = [];

// const PeerConnection = (function(){
//     let peerConnection;

//     const createPeerConnection = ()=>{
//         const config = {
//             iceServers:[
//                 {
//                     urls: 'stun:stun.l.google.com:19302'
//                 }
//             ]
//         };
//         peerConnection = new RTCPeerConnection(config);

//         //add local string
//         localStream.getTracks().forEach(track => {
//             peerConnection.addTrack(track, localStream);
//         }) 
//         //listen to remote and add to local
//         peerConnection.ontrack = function(event){
//             remoteVideo.srcObject = event.streams[0];
//         }
//         //listen for ice candidate
//         peerConnection.onicecandidate = function(event){
//             if(event.candidate){
//                 socket.emit("icecandidate", event.candidate);
//             }
//         }
//         return peerConnection;
//     }
//     return{
//         getInstance: () =>{
//             if(!peerConnection){
//                 peerConnection = createPeerConnection();
//             }
//             return peerConnection
//         }
//     }
// })();
// //handle browser events
// createUserBtn.addEventListener("click", (e)=>{
//     if(username.value !== ""){
//         const userNameContainer = document.getElementById("username-input");
//         socket.emit("join-user", username.value);
//         userNameContainer.style.display = 'none';
//     }
// });
// endCallBtn.addEventListener("click", (e) =>{
//     socket.emit("call-ended", caller)
// })

// //handle socket events
// socket.on("joined", allusers =>{
//     console.log({ allusers });

//     const createUserHtml = () =>{
//         allusersHtml.innerHTML ="";
//         for(const user in allusers){
//             const li = document.createElement("li");
//             li.textContent = `${user} ${user === username.value ? "(You)" : ""}`

//             if(user !== username.value){
//                 const button = document.createElement("button");
//                 button.classList.add('call-btn');
//                 button.addEventListener("click", (e) =>{
//                     startCall(user);
//                 })
//                 const img = document.createElement("img");
//                 img.setAttribute("src", "/images/phone.png");
//                 img.setAttribute("width", 20);

//                 button.appendChild(img);

//                 li.appendChild(button);

//                 li.addEventListener(button)
//             }
//             allusersHtml.appendChild(li)
//         }
//     }
//     createUserHtml();
// })

// socket.on("offer", async ({from, to, offer}) =>{
//     const pc = PeerConnection.getInstance();

//     //set remote desc
//     await pc.setRemoteDesc(offer);
//     const answer = await pc.createAnswer();
//     await pc.setLocalDesc(answer);
//     socket.emit('answer', {from, to, answer:pc.localDescription})
//     caller = [from, to]

// })

// socket.on("answer", async({from, to, answer}) =>{
//     const pc = PeerConnection.getInstance();
//     await pc.setRemoteDesc(answer);
//     endCallBtn.style.display = 'block'
//     socket.emit("end-call", {from, to});
//     caller = [from, to]
// })


// socket.on("icecandidate", async candidate =>{
//     const pc = PeerConnection.getInstance();
//     await pc.addIceCandidate(new RTCIceCandidate(candidate))
// })

// socket.on("end-call", ({from, to}) =>{
//     endCallBtn.style.display = "block"
// })


// socket.on("call-ended", caller =>{
//     io.to(allusers[from].id).emit("call-ended", caller);
//     io.to(allusers[to].id).emit("call-ended", caller);
// })

// socket.on('call-ended', (caller) =>{
//     endCall()
// }
// )
// const startCall = async(user) =>{
//     console.log(user)
//     const pc = PeerConnection.getInstance();
//     const offer = await pc.createOffer()
//     console.log(offer)
//     await pc.setLocalDesc(offer);
//     socket.emit("offer",{from:username.value, to:user, offer:pc.LocalDesc})
// }

// const endCall = async() =>{
//     const pc = PeerConnection.getInstance();
//     if(pc){
//         pc.close();
//         endCallBtn.style.display="none"
//     }
// }


// //initialize
// const startMyVideo =async () =>{
//     try{
//         const stream = await navigator.mediaDevices.getUserMedia({
//             audio:true, video:true
//         })
//         console.log({stream});
//         localStream = stream;
//         localVideo.srcObject = stream;
//     }
//     catch(error){

//     }
// }
// startMyVideo()


const socket = io();
const createUserBtn = document.getElementById("create-user");
const username = document.getElementById("username");
const allusersHtml = document.getElementById("allusers");
const localVideo = document.getElementById("localVideo");
const remoteVideo = document.getElementById("remoteVideo");
const endCallBtn = document.getElementById("end-call-btn");
let localStream;
let caller = [];

// Peer connection setup
const PeerConnection = (function(){
    let peerConnection;

    const createPeerConnection = () => {
        const config = {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' }
            ]
        };
        peerConnection = new RTCPeerConnection(config);

        // Add local stream
        localStream.getTracks().forEach(track => {
            peerConnection.addTrack(track, localStream);
        });

        // Listen to remote stream and add to local
        peerConnection.ontrack = function(event){
            remoteVideo.srcObject = event.streams[0];
        };

        // Listen for ice candidate
        peerConnection.onicecandidate = function(event){
            if(event.candidate){
                socket.emit("icecandidate", event.candidate);
            }
        };
        return peerConnection;
    };

    return {
        getInstance: () => {
            if(!peerConnection){
                peerConnection = createPeerConnection();
            }
            return peerConnection;
        }
    };
})();

// Handle browser events
createUserBtn.addEventListener("click", (e) => {
    if(username.value !== ""){
        const userNameContainer = document.getElementById("username-input");
        if (userNameContainer) {
            socket.emit("join-user", username.value);
            userNameContainer.style.display = 'none';
        }
    }
});

endCallBtn.addEventListener("click", (e) => {
    socket.emit("call-ended", caller);
});

// Handle socket events
socket.on("joined", allusers => {
    console.log({ allusers });

    const createUserHtml = () => {
        allusersHtml.innerHTML = "";
        for(const user in allusers){
            const li = document.createElement("li");
            li.textContent = `${user} ${user === username.value ? "(You)" : ""}`;

            if(user !== username.value){
                const button = document.createElement("button");
                button.classList.add('call-btn');
                button.addEventListener("click", (e) => {
                    startCall(user);
                });
                const img = document.createElement("img");
                img.setAttribute("src", "/images/phone.png");
                img.setAttribute("width", 20);

                button.appendChild(img);
                li.appendChild(button);
            }
            allusersHtml.appendChild(li);
        }
    };

    createUserHtml();
});

socket.on("offer", async ({from, to, offer}) => {
    const pc = PeerConnection.getInstance();

    // Set remote description
    await pc.setRemoteDescription(offer);
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    socket.emit('answer', {from, to, answer: pc.localDescription});
    caller = [from, to];
});

socket.on("answer", async ({from, to, answer}) => {
    const pc = PeerConnection.getInstance();
    await pc.setRemoteDescription(answer);
    endCallBtn.style.display = 'block';
    caller = [from, to];
});

socket.on("icecandidate", async candidate => {
    const pc = PeerConnection.getInstance();
    await pc.addIceCandidate(new RTCIceCandidate(candidate));
});

socket.on("end-call", ({from, to}) => {
    endCallBtn.style.display = "none"; // Hide end call button
});

socket.on("call-ended", caller => {
    endCall();
});

// Start call function
const startCall = async (user) => {
    console.log(user);
    const pc = PeerConnection.getInstance();
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    socket.emit("offer", {from: username.value, to: user, offer: pc.localDescription});
};

// End call function
const endCall = async () => {
    const pc = PeerConnection.getInstance();
    if(pc){
        pc.close();
        endCallBtn.style.display = "none";
    }
};

// Initialize video
const startMyVideo = async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: true, 
            video: true
        });
        console.log({stream});
        localStream = stream;
        localVideo.srcObject = stream;
    } catch (error) {
        console.error("Error accessing media devices:", error);
    }
};
startMyVideo();
