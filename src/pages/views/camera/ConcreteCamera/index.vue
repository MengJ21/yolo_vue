<style lang="scss">
.total_wrap {
  display: flex;

  .local_wrap {
    flex: 1;

    video {
      width: 100%;
      height: 100%;
    }
  }

  .remote_wrap {
    flex: 1;

    video {
      width: 100%;
      height: 100%;
    }
  }

  .video_tool_wrap {
    flex: 1;
  }
}
</style>
<template>
  <div class="total_wrap">
    <!--    <div class="local_wrap">  这一个去除 后面我只在浏览器显示远程检测后的 视频所以只用一个video-->
    <!--      <video :src="localSrc" ref="localV" id="local_video" autoplay></video>-->
    <!--    </div>-->
    <div class="remote_wrap"><!--muted设置静音-->
      <video ref="remoteV" id="remote_video" autoplay></video>  <!--这一个应该-->
    </div>
    <div class="video_tool_wrap">
      <div>{{$route.query.name}}</div>
      <h5>选择摄像头源头:</h5>
      <ul>
        <li>
          <div>
            <ul style="padding: 0">
              <li @click="openLocalCam" v-show="(allVideoDevices.length===0)">本地摄像头</li>
              <!--          先打开本地摄像头 然后浏览器请求授权 这个时候浏览器打开的是一个 默认的摄像头的 之后用户可以更改当前摄像头 因为只有用户授权之后 才可以获取当前拥有的摄像头名称-->
              <li v-for="(device) in allVideoDevices" v-bind:key="device" @click="chooseViedoInput(device)">
                {{ device.deviceName }}
              </li>
              <!--      如果添加了远程摄像头那么这里将同时显示出远程摄像头
              下面是自己添加的远程摄像头  按照道理每当添加一个摄像头 数据库中应该进行存储的 但是不想搞了 直接不存了（还有摄像头的密码和用户名也要存的话还有考虑安全性-->

            </ul>
          </div>
        </li>

        <li>

        </li>
      </ul>
      <div style="margin-top: 100px"></div>
      <h5>操作</h5>
      <div>
        <button @click="this.ipCamDeviceInput.isShowIpCamInput=true">添加远程摄像头</button>
        <div class="" v-show="this.ipCamDeviceInput.isShowIpCamInput">
          <input v-model="this.ipCamDeviceInput.deviceName " placeholder="输入远程摄像头名称 必填">
          <input v-model="this.ipCamDeviceInput.url" placeholder="输入远程摄像头地址">
          <input v-model="this.ipCamDeviceInput.username" placeholder="用户名">
          <input v-model="this.ipCamDeviceInput.password" placeholder="密码">
          <button @click="addIpDevice">确定</button>
        </div>
      </div>
      <div style="margin-top: 20px">
        <div><span>当前选择输入设备：</span>{{ choosedDevice.deviceName }}</div>
        <button @click="reqYolovDetect">建立yoloe实时检测连接</button>
        <button @click="stopYolovDetect">断开连接</button>
      </div>
    </div>
    <div class="newtest">
      <button @click="connectDevice">测试</button>
    </div>
  </div>

</template>

<script>
// @ is an alias to /src
import {
  myPeerConnection, webcamStream, setLocalV, setRemoteV, setWebcamStream, setSource,setDeviceName,deviceName,source,
  createPeerConnection, handleGetUserMediaError,
  closeVideoCall
} from "/src/utils/wertcUtil"
//{ video: { frameRate: { ideal: 10, max: 15 } } };//帧率
//var constraints = { video: { facingMode: (front? "user" : "environment") } }; //前置摄像头和后置摄像头
//{video: {deviceId:'944263799996e6fe030a1cc3aedca331e71bda3059ff1123667a5b236f481947'},audio:false};//设置设备ID
export default {
  name: 'HomeView',
  components: {},
  data() {
    return {
      deviceName1: '',
      mediaConstraints: {video: true, audio: false},  //默认摄像头打开约束
      choosedDevice: {
        deviceName: "",//前端显示当前选择设备名称
        source: "", //需要知道 被选择的设备的source参数 yolo检测需要
      },//被用户选择用于 yolo检测的摄像头设备
      allVideoDevices: [], //目前所有可用与远程yolo检测视频流输入摄像头设备
      ipCamDeviceInput: { //用户添加远程摄像头的设备 时候的输入内容绑定
        isShowIpCamInput: false,
        deviceName: "",//添加一个远程摄像头必须给它起个名字
        url: "",
        username: "",
        password: "",
        source: "" //这个属性 传输给远程yolo检测的时候需要用到 由前面url username passsword根据 ip摄像头的类型rtsp等拼接得到
      }
    }
  },
  created() {
    console.log("接受name：" + this.$route.query.name)
    this.deviceName1 = this.$route.query.name;
    this.ipCamDeviceInput.deviceName = this.deviceName1;
    console.log("开始获取监控信息：")
    this.$axios.get("/user/getDeviceInfo/" + this.ipCamDeviceInput.deviceName)
        .then(res => {
          console.log("监控的详细信息：");
          console.log(res.data);
          if (res.data.url === "") {
            this.openLocalCam();
          }
        })
  },
  watch: {
    deviceName1(oldName,newName) {
      console.log("开始更新监控信息：")
      this.deviceName1 = this.$route.query.name;
      this.ipCamDeviceInput.deviceName = this.deviceName1;
      this.$axios.get("/user/getDeviceInfo/" + this.ipCamDeviceInput.deviceName)
          .then(res => {
            console.log("监控的详细信息：");
            console.log(res.data);
          })
    }
  },
  mounted() {
    console.log(myPeerConnection)
    // localVideoElement=document.getElementById("local_video")//this.$refs.localV;
    // remoteVideoElement=document.getElementById("remote_video")//this.$refs.remoteV;
    //TODO 不可以使用上面直接赋值给import的对象 import对象只可以读欸 但是可以调用import的对象的add的一些方法等
    // setLocalV(this.$refs.localV)  //取消这一步 只显示远程检测后的内容
    setRemoteV(this.$refs.remoteV)

  },
  methods: {
    connectDevice(){
      this.choosedDevice.deviceName="测试实验室3"
      this.choosedDevice.source="rtsp://///"
    },
    updateDeviceList() {
      const that = this
      if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
        console.log("不支持 enumerateDevices() .");
        return;
      }
      // 列出相机和麦克风。
      navigator.mediaDevices.enumerateDevices()
          .then(function (devices) {
            devices.forEach(function (device) {
              if (device.kind == 'videoinput') {
                device.source = "0"
                that.allVideoDevices.push(device)
              }
            });
          })
          .catch(function (err) {
            console.log(err.name + ": " + err.message);
          });
      that.allVideoDevices.push({facingMode: "user", deviceName: "前置摄像头", deviceId: "", source: "0", kind: "videoinput"}) // 前置
      that.allVideoDevices.push({
        facingMode: "environment",
        deviceName: "后置摄像头",
        deviceId: "",
        source: "0",
        kind: "videoinput"
      }) //后置
    },
    updateLocalCam(constraint) {
      const that = this;
      navigator.mediaDevices.getUserMedia(constraint)
          .then(function (stream) {
            // stream.getVideoTracks().forEach((track)=>{
            //     track.stop()
            // })
            // that.currentWebVideoStream = stream;
            // 旧的浏览器可能没有 srcObject
            setWebcamStream(stream) //其实这一步做不做都行
            if ("srcObject" in that.$refs.remoteV) {
              that.$refs.remoteV.srcObject = stream;
            } else {
              // 防止在新的浏览器里使用它，应为它已经不再支持了
              that.$refs.remoteV.src = window.URL.createObjectURL(stream);
            }
            that.$refs.remoteV.onloadedmetadata = function (e) {
              that.$refs.remoteV.play();
            };
          })
          .catch(function (err) {
            // console.log(err.name + ": " + err.message);
            handleGetUserMediaError(err);
            // return;
          });
    },
    closeLocalCam() {
      // this.$refs.remoteV.pause()
      this.$refs.remoteV.srcObject.getTracks().forEach(track => {
        track.stop(); //关闭本地的就好 对面会收到事件自己关闭
      });
    },
    openLocalCam() {
      const that = this
      // 老的浏览器可能根本没有实现 mediaDevices，所以我们可以先设置一个空的对象
      if (navigator.mediaDevices === undefined) {
        navigator.mediaDevices = {};
      }

      // 一些浏览器部分支持 mediaDevices。我们不能直接给对象设置 getUserMedia
      // 因为这样可能会覆盖已有的属性。这里我们只会在没有 getUserMedia 属性的时候添加它。
      if (navigator.mediaDevices.getUserMedia === undefined) {
        navigator.mediaDevices.getUserMedia = function (constraints) {

          // 首先，如果有 getUserMedia 的话，就获得它
          var getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

          // 一些浏览器根本没实现它 - 那么就返回一个 error 到 promise 的 reject 来保持一个统一的接口
          if (!getUserMedia) {
            return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
          }

          // 否则，为老的 navigator.getUserMedia 方法包裹一个 Promise
          return new Promise(function (resolve, reject) {
            getUserMedia.call(navigator, constraints, resolve, reject);
          });
        }
      }
      //{ video: { frameRate: { ideal: 10, max: 15 } } };//帧率
      //var constraints = { video: { facingMode: (front? "user" : "environment") } }; //前置摄像头和后置摄像头
      // let constraint= {video:true,audio:false};
      let constraint = {
        video: {deviceId: '944263799996e6fe030a1cc3aedca331e71bda3059ff1123667a5b236f481947'},
        audio: false
      };//设置设备ID
      that.updateLocalCam(that.mediaConstraints)
      that.choosedDevice = {source: "0", deviceName: "默认的本地摄像头"} //打开摄像头的话 默认的被选择的设备就是本地的 设置source='0'
      that.updateDeviceList()
      navigator.mediaDevices.ondevicechange = (event) => {
        that.updateDeviceList();
      };
    },
    chooseViedoInput(device) {
      if (device.source == "0") {
        if (device.deviceId == "") {
          this.mediaConstraints.video = {facingMode: device.facingMode}
        } else {
          this.mediaConstraints.video = {deviceId: device.deviceId}
        }
      }
      console.log("update")
      console.log(this.mediaConstraints)
      //每一次被更新之前 先关闭 之前打开的摄像头
      if (webcamStream) {
        this.closeLocalCam()
      }
      if (device.source == "0")
        this.updateLocalCam(this.mediaConstraints)
      this.choosedDevice = device //设置本地备选则摄像头设备
    },
    addIpDevice() {
      // 到时候 用户输入的url就是rtsp://113.55.103.73:30002/h264/ch1/main/av_stream  这一串admin:a1234567@
      // rtsp://admin:a1234567@113.55.103.73:30002/h264/ch1/main/av_stream  rtsp://113.55.103.73:30002/h264/ch1/main/av_stream
      let input = {...this.ipCamDeviceInput}
      if (input.url.startsWith("rtsp")) { //如果远程摄像头是rtsp格式按照以下拼接 （没试过其它的http等对于yolo来讲拼接方式是否是一样的所以这里在那时先做一个判断）
        let end = input.url.substring(7, input.url.length)
        let start = "rtsp://" + input.username + ":" + input.password
        input.source = start + "@" + end
      } else {
        input.source = input.url
      }
      console.log(input.source)
      this.allVideoDevices.push(input)
      console.log(this.allVideoDevices)
      this.ipCamDeviceInput.isShowIpCamInput = false//关闭输入框
    },
    async reqYolovDetect() {
      const that = this
      if (this.choosedDevice.source == "") {
        return
      }
      setSource(this.choosedDevice.source)
      setDeviceName(this.choosedDevice.deviceName)
      await createPeerConnection()
      console.log(myPeerConnection)
      // try {  取消这个了 由用户选择输入的摄像头设备
      //   let webcamStream1 = await navigator.mediaDevices.getUserMedia(that.mediaConstraints);
      //   setWebcamStream(webcamStream1)
      //   this.$refs.localV.srcObject = webcamStream;
      // } catch (err) {
      //   handleGetUserMediaError(err);
      //   return;
      // }
      // Add the tracks from the stream to the RTCPeerConnection
      try {
        if (source == "0") { //如果被选择是本地摄像头 把选择的本地视频流添加到连接中 会触发谈判
          this.$refs.remoteV.srcObject.getTracks().forEach(
              //好像不用赋值给transceiver的
              // transceiver = track => myPeerConnection.addTransceiver(track, {streams: [webcamStream]})
              track => myPeerConnection.addTransceiver(track, {streams: [this.$refs.remoteV.srcObject]})
          );
        } else {//如果是远程摄像头 也需要触发谈判所以 也给连接添加一个 为了触发事件
          myPeerConnection.addTransceiver("video")
        }
        //
        // //需要 谈判 触发谈判
        // webcamStream.getTracks().forEach(
        //     //好像不用赋值给transceiver的
        //     // transceiver = track => myPeerConnection.addTransceiver(track, {streams: [webcamStream]})
        //     track => myPeerConnection.addTransceiver(track, {streams: [webcamStream]})
        // );
      } catch (err) {
        handleGetUserMediaError(err);
      }
    },
    stopYolovDetect() {
      closeVideoCall()
      let dataH = {
        // name: myUsername,
        // target: targetUsername,暂时不需要
        type: "hang-up",
        deviceName:deviceName,
      };
      this.$axios.post("/signal/hangUp", dataH)
          .then((response) => {
            console.log(response)
            // if(response.data.code==200){
            //   alert("断开连接成功")
            // }else {
            //   alert("断开连接失败")
            // }
          })
    }
  }
}
</script>
