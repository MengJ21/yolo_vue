<template>
  <div class="h-full w-full flex">
    <div class="w-1/6 h-full" style="width: 200px">
      <div class="h-1/8 w-full">
        <svg t="1671445287395" class="icon m-auto" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3953" width="60" height="60"><path d="M0 0h1024v1024H0V0z" fill="#202425" opacity=".01" p-id="3954"></path><path d="M989.866667 512c0 263.918933-213.947733 477.866667-477.866667 477.866667S34.133333 775.918933 34.133333 512 248.081067 34.133333 512 34.133333s477.866667 213.947733 477.866667 477.866667z" fill="#11AA66" p-id="3955"></path><path d="M546.133333 102.4a34.133333 34.133333 0 1 0-68.266666 0v104.277333A307.336533 307.336533 0 0 0 206.677333 477.866667H102.4a34.133333 34.133333 0 1 0 0 68.266666h104.277333A307.336533 307.336533 0 0 0 477.866667 817.322667V921.6a34.133333 34.133333 0 1 0 68.266666 0v-104.277333A307.336533 307.336533 0 0 0 817.322667 546.133333H921.6a34.133333 34.133333 0 1 0 0-68.266666h-104.277333A307.336533 307.336533 0 0 0 546.133333 206.677333V102.4z" fill="#FFFFFF" p-id="3956"></path><path d="M717.858133 391.168a69.8368 69.8368 0 0 1-137.079466-19.2512c0-31.744 21.265067-58.299733 50.2784-66.8672A237.568 237.568 0 0 0 512 273.066667a238.933333 238.933333 0 0 0-238.933333 238.933333 237.568 237.568 0 0 0 48.5376 143.906133c5.632-11.537067 17.408-19.524267 31.095466-19.524266a34.679467 34.679467 0 1 1 15.2576 65.9456A237.568 237.568 0 0 0 512 750.933333a238.933333 238.933333 0 0 0 238.933333-238.933333 237.568 237.568 0 0 0-33.0752-120.832" fill="#FFAA44" p-id="3957"></path><path d="M529.134933 379.118933l-0.068266-2.594133-5.597867-0.580267a136.533333 136.533333 0 1 0 124.0064 118.9888 119.466667 119.466667 0 0 1-118.3744-115.8144" fill="#11AA66" p-id="3958"></path></svg>
      </div>
      <sidebar></sidebar>
    </div>
    <div class="w-5/6 h-full">
      <div class="mt-4">
        <Nav></Nav>
      </div>
      <div class="mt-4 ml-4">
        <AppMain></AppMain>
      </div>
    </div>
  </div>
</template>

<script>
import Sidebar from "../components/SideBar/sidebar.vue";
import Nav from '../components/NavigationBar/index.vue';
import AppMain from "../components/AppMain.vue";
export default {
  name: "index",
  components: { AppMain, Sidebar,Nav},
  data() {
    return {
      urls : [
        'https://fuss10.elemecdn.com/a/3f/3302e58f9a181d2509f3dc0fa68b0jpeg.jpeg',
        'https://fuss10.elemecdn.com/1/34/19aa98b1fcb2781c4fba33d850549jpeg.jpeg',
        'https://fuss10.elemecdn.com/0/6f/e35ff375812e6b0020b6b4e8f9583jpeg.jpeg',
        'https://fuss10.elemecdn.com/9/bb/e27858e973f5d7d3904835f46abbdjpeg.jpeg',
        'https://fuss10.elemecdn.com/d/e6/c4d93a3805b3ce3f323f7974e6f78jpeg.jpeg',
        'https://fuss10.elemecdn.com/3/28/bbf893f792f03a54408b3b7a7ebf0jpeg.jpeg',
        'https://fuss10.elemecdn.com/2/11/6535bcfb26e4c79b48ddde44f4b6fjpeg.jpeg',]

    }
  }
}
</script>

<style scoped>
.demo-image__lazy {
  height: 400px;
  overflow-y: auto;
}
.demo-image__lazy .el-image {
  display: block;
  min-height: 200px;
  margin-bottom: 10px;
}
.demo-image__lazy .el-image:last-child {
  margin-bottom: 0;
}
</style>
