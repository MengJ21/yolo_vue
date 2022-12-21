// @ts-ignore
import router from '/src/router/index'
import { ElMessage } from "element-plus"
// @ts-ignore
import {getToken} from "../utils/cache/cookies";


router.beforeEach(async (to, _from, next) => {
  // 判断该用户是否登录
  if (to.path === "/login") {
    next();
  }
  if (getToken()) {
    if (to.path === "/login") {
      // 如果已经登录，并准备进入 Login 页面，则重定向到主页
      next({ path: "/" })
    } else {
      console.log("进入到应有的界面")
      next()
    }
  } else {
    // 如果没有 Token
      console.log("进入登录页")
      next("/login")
    }
})

router.afterEach(() => {
})
