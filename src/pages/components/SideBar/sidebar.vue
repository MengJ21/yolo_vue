<template>
  <el-radio-group v-model="isCollapse" style="margin-bottom: 20px">
    <el-radio-button :label="false">expand</el-radio-button>
    <el-radio-button :label="true">collapse</el-radio-button>
  </el-radio-group>
  <el-menu
      default-active="2"
      class="el-menu-vertical-demo"
      :collapse="isCollapse"
      @open="handleOpen"
      @close="handleClose"
  >
    <el-sub-menu index="1">
        <template #title>
          <el-icon><location /></el-icon>
          <span  @click="getCameraInfo">摄像头</span>
        </template>
      <el-menu-item-group>
        <el-menu-item v-for="device in devices" index="{{device.deviceName}}" @click="getConcreteCamera(device.deviceName)">{{device.deviceName}}</el-menu-item>
      </el-menu-item-group>
    </el-sub-menu>
    <el-menu-item index="2">
      <el-icon><icon-menu /></el-icon>
      <template #title>消息中心</template>
    </el-menu-item>
    <el-menu-item index="3">
      <el-icon><document /></el-icon>
      <template #title>历史记录</template>
    </el-menu-item>
    <el-menu-item index="4">
      <el-icon><setting /></el-icon>
      <template #title>个人设置</template>
    </el-menu-item>
  </el-menu>
</template>

<script lang="ts" setup>
import {onMounted, ref} from 'vue'
import {
  Document,
  Menu as IconMenu,
  Location,
  Setting,
} from '@element-plus/icons-vue'
import {useRouter} from "vue-router";
import request from "/src/utils/axios.js"

const router = useRouter();
const devices = ref<any[]>()
const isCollapse = ref(true)
const handleOpen = (key: string, keyPath: string[]) => {
  console.log(key, keyPath)
}
const handleClose = (key: string, keyPath: string[]) => {
  console.log(key, keyPath)
}
const getCameraInfo = () => {
  // 路由跳转
  router.push({ path: "/camera/allCamera"})
}

const getConcreteCamera = (name) => {
  console.log("传入name：" + name)
  router.push({
    path:'/camera/concreteCamera',
    query:{
      name: name
    }
  })
}
onMounted(() => {
  request.post("/user/getAllDevice")
      .then((res: any) => {
        console.log("sidebar获取所有设备信息：")
        console.log(res.data)
        devices.value = res.data.data;
        console.log(devices)
      }).catch(() => {
    devices.value = [];
  })
})
</script>

<style>
.el-menu-vertical-demo:not(.el-menu--collapse) {
  width: 200px;
  min-height: 400px;
}
</style>
