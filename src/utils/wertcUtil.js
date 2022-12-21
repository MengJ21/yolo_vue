import request from "@/utils/axios";

let myPeerConnection=null;
let webcamStream=null;
let localVideoElement=null;
let remoteVideoElement=null;
let transceiver=null;
let source=null;
let deviceName=null;
function setSource(source1){ //source是string字符串
    source=source1
}
function setLocalV(element){
    localVideoElement=element
}
function setRemoteV(element){
    remoteVideoElement=element
}
function setWebcamStream(streamW){
    console.log("setStream")
    webcamStream=streamW
    console.log(webcamStream)
}
function setTransceiver(tran){
    transceiver=tran
}
function setDeviceName(name){
    deviceName=name
}

async function createPeerConnection() { //TODO 创建peerc
    // log("Setting up a connection...");
    // Create an RTCPeerConnection which knows to use our chosen
    // STUN server.指定一些二ICE服务器 ice服务器可以帮我们在两个节点之间选择合适 协议传输流可以这么理解 两个节点需要交谈他们的视频格式等其它信息
    myPeerConnection = new RTCPeerConnection({
        iceServers: [     // Information about ICE servers - Use your own!
            {
                urls: "stun:stun.l.google.com:19302" + "",  // A STUN server 82.156.82.185:3478 这个配不配都行 这里用的是谷歌开源的ice stun服务器
            },
        ]
    });
    // myPeerConnection=new RTCPeerConnection()
    // Set up event handlers for the ICE negotiation process.
    myPeerConnection.onnegotiationneeded = handleNegotiationNeededEvent; //协商谈判事件 一旦给peerc加入track磁道的画
    myPeerConnection.onicecandidate = handleICECandidateEvent;//一旦setLocalDesc的画会进行ice的候选
    //TODO RTCPeerConnection.setRemoteDescription()调用该方法时后会触发 表示新的磁道加入的事件
    myPeerConnection.ontrack = handleTrackEvent; //监听磁道添加事件 即从远程获取到新的视频流 同上一行理解
    //TODO 上面三个是必须的
    myPeerConnection.oniceconnectionstatechange = handleICEConnectionStateChangeEvent;
    myPeerConnection.onicegatheringstatechange = handleICEGatheringStateChangeEvent;
    myPeerConnection.onsignalingstatechange = handleSignalingStateChangeEvent;//新版本iceConnectionState
    myPeerConnection.onconnectionstatechange=handleConnectionStateChangeEvent;
    myPeerConnection.onremovetrack=handleRemoveTrackEvent;
}
/**创建peerc后一旦加入track 会触发 谈判内容*/
async function handleNegotiationNeededEvent() {
    console.log("*** Negotiation needed");
    try {
        // log("---> Creating offer");//需要创建本地的流供应可以这么理解 将本地是视频源头供应
        const offer = await myPeerConnection.createOffer();
        // If the connection hasn't yet achieved the "stable" state,
        // return to the caller. Another negotiationneeded event
        // will be fired when the state stabilizes.
        if (myPeerConnection.signalingState != "stable") {
            // log("     -- The connection isn't stable yet; postponing...")
            return;
        }
        // Establish the offer as the local peer's current
        // description.
        // log("---> Setting local description to the offer");
        await myPeerConnection.setLocalDescription(offer);//peerc设置本地描述 为offer流
        // 一旦添加这个就会把流传入peerc种此时必定需要ice协议 所以触发ice候选
        // Send the offer to the remote peer.
        // log("---> Sending the offer to the remote peer");
        let dataN={ //需要告诉 信令服务器此时我要进行视频检测的服务器 根据它的类型做出响应视频流
            // 这个方法还没实现等我把服务端写了再说
            // name: myUsername,
            // target: targetUsername, 目前这里不需要指定自己和对方的名字 因为当前状态下对方是固定的一个人
            type: "video-offer",
            desc: myPeerConnection.localDescription, //这个本地会话描述 里面的信息很多返回本地段的会话控制的信息
            source: source, //
            deviceName:deviceName

            // 包括type{offer,answer,rollback}还有sdp(会话描述协议内容，主要用来传输流） 可以转换为json字符串
        };request.post("/signal/offer",dataN)
            .then((response)=>{
                console.log(response)
                handleVideoAnswerMsg(response.data)
                // if(response.data.code==200){
                //     handleVideoAnswerMsg(response.data)
                // }else {
                //     alert("请求offer失败！")
                // }
            })
    } catch(err) {
        console.log("*** The following error occurred while handling the negotiationneeded event:");
        // reportError(err);
    }
}
//一旦将 设置本地会话描述需要由 ice候选进行介入
function handleICECandidateEvent(event) {
    //需要告诉信令服务器 它准备了一个ice候选 由event获取 信令服务需要告诉接收方（这里也是服务器）设置候选
    if (event.candidate) {
        // log("*** Outgoing ICE candidate: " + event.candidate.candidate);
        let dataI={
            type: "new-ice-candidate",
            // target: targetUsername, 目前这个不需要指定远程接收者姓名 这个是固定的一个人
            candidate: event.candidate,
            deviceName:deviceName
        };
        request.post("/signal/iceCandidate",dataI)
            .then((response)=>{
                console.log(response)
                // if(response.data.code==200){
                //     console.log("建立ice candidate成功")
                // }else {
                //     alert("建立ice candidate失败")
                // }
                //然后就什么都不需要了好像 在这里
            })
    }
}
function handleTrackEvent(event) {
    console.log("你好啊track")
    //当远程的接收那个人和本地正式通过peerc设置了一个连接后 远程一旦给peerc加入一个磁道流，这边会收到这个事件
    // log("*** Track event");
    //在这里就可以通过event获取到磁道 并把远程那个磁道流加入本地显示
    console.log(event)
    remoteVideoElement.srcObject = event.streams[0];
    // document.getElementById("received_video").srcObject = event.streams[0];
    // document.getElementById("hangup-button").disabled = false;
}
//监听 ice 两个节点之间连接状态的变化 这个状态是两个节点的ice协议的服务器状态 不是peerc的 不太理解？？？
function handleICEConnectionStateChangeEvent(event) {
    console.log("*** ICE connection state changed to " + myPeerConnection.iceConnectionState);
    switch(myPeerConnection.iceConnectionState) {
        case "closed":
        case "failed":
        case "disconnected":
            closeVideoCall(); //一旦断开则 本地断开与远程的视频连接这个方法还没有实先
            break;
    }
}
//监听ice的收集状态 目前没有用到 也不太理解 获取创建peerc种的ice服务器的内容吗？？
function handleICEGatheringStateChangeEvent(event) {
    console.log("*** ICE gathering state changed to: " + myPeerConnection.iceGatheringState);
}
//监听信令状态改变 这个信令状态是指peerc的 不是我们的信令服务器 可以理解为peerc的两边建立的连接状态 一旦关闭的话就结束本地视频流传输
function handleSignalingStateChangeEvent(event) {
    console.log("*** WebRTC signaling state changed to: " + myPeerConnection.signalingState);
    //一旦两边的peerc的信令发生了变化
    switch(myPeerConnection.signalingState) {
        case "closed":
            closeVideoCall();//变为closed需要关闭本地视频流
            break;
    }
}
//一旦有一方通过peerc removertrack会触发该事件 本地进行监测一旦发生结束视频流童话
// 不过一般好像我们不会去调用removetrack应该 是指像关闭摄像头这种把
function handleRemoveTrackEvent(event) {
    //观察对面的视频流 一旦移除本地就不进行传输率 直接close
    // var stream = document.getElementById("received_video").srcObject;
    let stream=remoteVideoElement.srcObject;
    var trackList = stream.getTracks();

    if (trackList.length == 0) {
        closeVideoCall();
    }
}

function handleConnectionStateChangeEvent(event){
    if (myPeerConnection.connectionState =='failed' || myPeerConnection.connectionState =='closed'){
        closeVideoCall()
    }
}


//处理当收到 有人请求我通话的offer
async function handleVideoOfferMsg(msg) {
    // targetUsername = msg.name; //
    // If we're not already connected, create an RTCPeerConnection
    // to be linked to the caller.
    console.log("Received video chat offer from ");
    if (!myPeerConnection) {
        createPeerConnection();
    }
    // We need to set the remote description to the received SDP offer
    // so that our local WebRTC layer knows how to talk to the caller.
    var desc = new RTCSessionDescription(msg.sdp); //将对放的创建sdp内容创建  会话描述
    // If the connection isn't stable yet, wait for it...
    if (myPeerConnection.signalingState != "stable") {
        // log("  - But the signaling state isn't stable, so triggering rollback");
        // Set the local and remove descriptions for rollback; don't proceed
        // until both return.
        await Promise.all([
            myPeerConnection.setLocalDescription({type: "rollback"}),
            myPeerConnection.setRemoteDescription(desc)
        ]);
        // return; TODO 为什么需要这个呢 应该不用吧？？
    } else {
        // log ("  - Setting remote description");
        await myPeerConnection.setRemoteDescription(desc); //将对方的作为sdp会话描述作为peerc的远程会话描述
    }
    //TODO 需要改变本地的webcamStream和tranceiver
    // Get the webcam stream if we don't already have it
    if (!webcamStream) {
        try {
            webcamStream = await navigator.mediaDevices.getUserMedia({video:true,audio:false}); //mediaConstraints
        } catch(err) {
            handleGetUserMediaError(err);
            return;
        }
        // document.getElementById("local_video").srcObject = webcamStream;
        localVideoElement.srcObject = webcamStream;
        // Add the camera stream to the RTCPeerConnection
        try {
            webcamStream.getTracks().forEach( //此时就需要我把 本地的流加到peerc种
                // TODO 不过我有个疑问：响应视频童话的这方的peerc的监听track事件如何判断当前改变的tarck是哪一个呢？  还有此时还会触发谈判吗
                //TODO 或许可以这样理解 因为这个时候 peerc已经设置了远程会话描述 谈判的目的似乎就是为了设置会话描述信息 所以此时不会再触发谈判
                //TODO 是给peerc加一个收发器 一个收发器是一个双向的即 接受发和供应方
                transceiver = track => myPeerConnection.addTransceiver(track, {streams: [webcamStream]})
            );
        } catch(err) {
            handleGetUserMediaError(err);
        }
    }
    //TODO 给peerc设置了远程会话描述  此时需要给peerc设置 利用create answer创建本地会话描述 这样peerc既有远程也有本地了 所以成功给视频流传输建立peerc
    // log("---> Creating and sending answer to caller");
    await myPeerConnection.setLocalDescription(await myPeerConnection.createAnswer());
    // sendToServer({
    //     // name: myUsername,
    //     // target: targetUsername,
    //     type: "video-answer",
    //     sdp: myPeerConnection.localDescription
    // });
}

//TODO 对方回应我的视频请求
async function handleVideoAnswerMsg(msg) {
    console.log("*** Call recipient has accepted our call");
    // Configure the remote description, which is the SDP payload
    // in our "video-answer" message.
    console.log(msg.desc)
    var desc = new RTCSessionDescription(msg.desc); //获取对方sdp协议传输的内容 创建一个会话描述
    await myPeerConnection.setRemoteDescription(desc).catch(reportError); //该会话描述就是远程的会话描述 相当于对方的视频流
}


//TODO 处理打开本地媒体设备失败
function handleGetUserMediaError(e) {
    console.log(e)
    switch(e.name) {
        case "NotFoundError":
            alert("Unable to open your call because no camera and/or microphone" +
                "were found.");
            break;
        case "SecurityError":
        case "PermissionDeniedError":
            // Do nothing; this is the same as the user canceling the call.
            break;
        default:
            alert("Error opening your camera and/or microphone: " + e.message);
            break;
    }
    // Make sure we shut down our end of the RTCPeerConnection so we're
    // ready to try again.
    closeVideoCall();
}

//收到对方的 提出的候选内容 给自己的peerc进行设置  （如出错则进行进行异步协商）
async function handleNewICECandidateMsg(msg) {
    var candidate = new RTCIceCandidate(msg.candidate);

    // log("*** Adding received ICE candidate: " + JSON.stringify(candidate));
    try {
        await myPeerConnection.addIceCandidate(candidate)
    } catch(err) {
        reportError(err);
    }
}
//TODO 收到对方请求关闭此次视频通话出阿叔
function handleHangUpMsg(msg) {
    console.log("*** Received hang up notification from other peer");
    closeVideoCall();
}

//关闭视频流传输
function closeVideoCall() {
    // var localVideo = document.getElementById("local_video");
    let localVideo=localVideoElement;
    let remoteVideo=remoteVideoElement;
    console.log("Closing the call");
    if(webcamStream){
        console.log(webcamStream)
        // webcamStream=new MediaStream() //关闭本地谁先那个头
        webcamStream.getTracks().forEach(track => {
            track.stop(); //关闭本地的就好 对面会收到事件自己关闭
        });
    }
    webcamStream = null;
    // Close the RTCPeerConnection
    if (myPeerConnection) {
        console.log("--> Closing the peer connection");
        // Disconnect all our event listeners; we don't want stray events
        // to interfere with the hangup while it's ongoing.
        myPeerConnection.ontrack = null;
        myPeerConnection.onnicecandidate = null;
        myPeerConnection.oniceconnectionstatechange = null;
        myPeerConnection.onsignalingstatechange = null;
        myPeerConnection.onicegatheringstatechange = null;
        myPeerConnection.onnotificationneeded = null;
        myPeerConnection.onnegotiationneeded=null;
        myPeerConnection.onconnectionstatechange=null;
        myPeerConnection.onremovetrack=null
        // Stop all transceivers on the connection
        myPeerConnection.getTransceivers().forEach(transceiver => {
            transceiver.stop();
        });
        // Stop the webcam preview as well by pausing the <video>
        // element, then stopping each of the getUserMedia() tracks
        // on it.
        if (localVideo && localVideo.srcObject) {  //这里只显示远程的 所以 不用关闭本地的
            localVideo.pause();
            localVideo.srcObject.getTracks().forEach(track => {
                track.stop(); //关闭本地的就好 对面会收到事件自己关闭
            });
        }
        if(remoteVideo && remoteVideo.srcObject){
            remoteVideo.pause();
            remoteVideo.srcObject.getTracks().forEach(track => {
                track.stop(); //关闭本地的就好 对面会收到事件自己关闭
            });
        }

        // Close the peer connection
        myPeerConnection.close();
        myPeerConnection = null;

    }
    // Disable the hangup button
    // document.getElementById("hangup-button").disabled = true;
    // targetUsername = null;
}

export {
    myPeerConnection,webcamStream,setLocalV,setRemoteV,setWebcamStream,setTransceiver,setSource,setDeviceName,deviceName,source,
    createPeerConnection,handleGetUserMediaError,closeVideoCall
}





