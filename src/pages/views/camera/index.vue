<script lang="ts" setup>
import { reactive, ref, watch, onMounted } from "vue"
import { type FormInstance, type FormRules, ElMessage, ElMessageBox } from "element-plus"
import { Search, Refresh, CirclePlus, Delete, Download, RefreshRight } from "@element-plus/icons-vue"
import { usePagination } from "/src/hooks/usePagination"
import request from "/src/utils/axios.js"
import jsDateFormatter from "/src/utils/time.js"
import router from "../../../router/index";

const loading = ref<boolean>(false)
const { paginationData, handleCurrentChange, handleSizeChange } = usePagination()

//#region 增
const dialogVisible = ref<boolean>(false)
const formRef = ref<FormInstance | null>(null)
const device = reactive({
  url: "",
  deviceName: ""
})
const radio1 = ref('1')
const cameraStatus = ref<boolean>(true)
const formRules: FormRules = reactive({
  ip: [{ required: true, trigger: "blur", message: "请输入ip地址" }],
})
const handleCreate = () => {
  formRef.value?.validate((valid: boolean) => {
    if (valid) {
      request.post("/user/addDevice",device)
          .then((res: any) => {
            console.log(res.data);
            getTableData();
            router.push({
              path:'/camera/concreteCamera',
              query:{
                name: device.deviceName
              }
            })
          }).catch(() => {
            console.log("添加失败！")
      })
      // if (currentUpdateId.value === undefined) {
      //   createTableDataApi({
      //     username: formData.username,
      //     password: formData.password
      //   }).then(() => {
      //     ElMessage.success("新增成功")
      //     dialogVisible.value = false
      //     getTableData()
      //   })
      // } else {
      //   updateTableDataApi({
      //     id: currentUpdateId.value,
      //     username: formData.username
      //   }).then(() => {
      //     ElMessage.success("修改成功")
      //     dialogVisible.value = false
      //     getTableData()
      //   })
      // }
    } else {
      return false
    }
  })
}
const resetForm = () => {
  currentUpdateId.value = undefined
  device.url = ""
  device.deviceName = ""
}
//#endregion

//#region 删
const handleDelete = (row: any) => {
  ElMessageBox.confirm(`正在删除用户：${row.username}，确认删除？`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(() => {
    // deleteTableDataApi(row.id).then(() => {
    //   ElMessage.success("删除成功")
    //   getTableData()
    // })
  })
}
//#endregion

//#region 改
const currentUpdateId = ref<undefined | string>(undefined)
const handleUpdate = (row: any) => {
  console.log(row)
  currentUpdateId.value = row.id
  device.url = row.url
  device.deviceName = row.deviceName
  dialogVisible.value = true
}
//#endregion

//#region 查
const tableData = ref<any[]>()
const searchFormRef = ref<FormInstance | null>(null)
const searchData = reactive({
  url: "",
  phone: ""
})
const getTableData = () => {
  loading.value = true
      request.post("/user/getAllDevice")
      .then((res: any) => {
        console.log("获取所有设备信息：")
        console.log(res.data)
        tableData.value = res.data.data;
        console.log(tableData)
      }).catch(() => {
            tableData.value = [];
          })
  loading.value = false
  // getTableDataApi({
  //   currentPage: paginationData.currentPage,
  //   size: paginationData.pageSize,
  //   username: searchData.username || undefined,
  //   phone: searchData.phone || undefined
  // })
  //     .then((res: any) => {
  //       paginationData.total = res.data.total
  //       tableData.value = res.data.list
  //     })
  //     .catch(() => {
  //       tableData.value = []
  //     })
  //     .finally(() => {
  //       loading.value = false
  //     })
}
const handleSearch = () => {
  if (paginationData.currentPage === 1) {
    getTableData()
  }
  paginationData.currentPage = 1
}
const resetSearch = () => {
  searchFormRef.value?.resetFields()
  if (paginationData.currentPage === 1) {
    getTableData()
  }
  paginationData.currentPage = 1
}
const handleRefresh = () => {
  getTableData()
}
const localCamera = () => {
  cameraStatus.value = true;
}
const remoteCamera = () => {
  cameraStatus.value = false

}
const test = (res) => {
  console.log(res)
}
onMounted(() => {
  getTableData();
})
//#endregion

/** 监听分页参数的变化 */
// watch([() => paginationData.currentPage, () => paginationData.pageSize], getTableData, { immediate: true })
</script>

<template>
  <div class="app-container">
    <el-card v-loading="loading" shadow="never" class="search-wrapper">
      <el-form ref="searchFormRef" :inline="true" :model="searchData">
        <el-form-item prop="username" label="名称">
          <el-input v-model="searchData.url" placeholder="请输入" />
        </el-form-item>
        <el-form-item prop="url" label="url">
          <el-input v-model="searchData.url" placeholder="请输入" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">查询</el-button>
          <el-button :icon="Refresh" @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    <el-card v-loading="loading" shadow="never">
      <div class="toolbar-wrapper">
        <div>
          <el-button type="primary" :icon="CirclePlus" @click="dialogVisible = true">新增摄像头</el-button>
          <el-button type="danger" :icon="Delete">批量删除</el-button>
        </div>
        <div>
          <el-tooltip content="下载">
            <el-button type="primary" :icon="Download" circle />
          </el-tooltip>
          <el-tooltip content="刷新表格">
            <el-button type="primary" :icon="RefreshRight" circle @click="handleRefresh" />
          </el-tooltip>
        </div>
      </div>
      <div class="table-wrapper">
        <el-table :data="tableData">
          <el-table-column type="selection" width="50" align="center" />
          <el-table-column prop="deviceName" label="名称" align="center" />
          <el-table-column prop="url" label="url" align="center" />
          <el-table-column prop="isDeleted" label="状态" align="center">
            <template #default="scope">
              <el-tag v-if="scope.row.isDeleted" type="success" effect="plain" @click="test(scope.row)">启用</el-tag>
              <el-tag v-else type="danger" effect="plain" @click="test(scope.row.isDeleted)">禁用</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="创建时间" align="center" />
          <el-table-column fixed="right" label="操作" width="150" align="center">
            <template #default="scope">
              <el-button type="primary" text bg size="small" @click="handleUpdate(scope.row)">修改</el-button>
              <el-button type="danger" text bg size="small" @click="handleDelete(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div class="pager-wrapper">
        <el-pagination
            background
            :layout="paginationData.layout"
            :page-sizes="paginationData.pageSizes"
            :total="paginationData.total"
            :page-size="paginationData.pageSize"
            :currentPage="paginationData.currentPage"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
    <!-- 新增/修改 -->
    <el-dialog
        v-model="dialogVisible"
        :title="currentUpdateId === undefined ? '新增摄像头' : '修改摄像头信息'"
        @close="resetForm"
        width="30%"
    >
      <el-form ref="formRef" :model="device" :rules="formRules" label-width="100px" label-position="left">
        <div class="mb-2 flex items-center text-sm">
          <el-radio-group v-model="radio1" class="ml-4">
            <el-radio label="1" size="large" @click="localCamera">本地摄像头</el-radio>
            <el-radio label="2" size="large" @click="remoteCamera">远程摄像头</el-radio>
          </el-radio-group>
        </div>
        <el-form-item prop="deviceName" label="名称">
          <el-input v-model="device.deviceName" placeholder="请输入" />
        </el-form-item>
        <el-form-item prop="password" label="url">
          <el-input v-model="device.url" :disabled="cameraStatus" placeholder="请输入" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleCreate">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.search-wrapper {
  margin-bottom: 20px;
  :deep(.el-card__body) {
    padding-bottom: 2px;
  }
}

.toolbar-wrapper {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.table-wrapper {
  margin-bottom: 20px;
}

.pager-wrapper {
  display: flex;
  justify-content: flex-end;
}
</style>
