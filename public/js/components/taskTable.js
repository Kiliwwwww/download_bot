// taskTable.js
import {fetchTasks} from '../api/taskService.js'
import {themeOverrides} from '../utils/theme.js'
import {retryById} from '../api/retryService.js'
import {createJmDetailModal} from '/public/js/model/JmDetailModal.js'
import {createJmBottomBarComponent} from '/public/js/model/JmBottomBarComponent.js'

export function createTaskTable(Vue, naive) {
    const {ref, h, onMounted, onBeforeUnmount, watch} = Vue
    const {
        NCard,
        NSpace,
        NButton,
        NText,
        NDataTable,
        NModal,
        NPagination,
        NSwitch,
        NProgress,
        useMessage,
        useLoadingBar
    } = naive

    return {
        template: `
      <div style="display: flex; justify-content: center; margin-top: 50px;">
        <n-card style="width: 1100px; padding: 25px; box-shadow: 0 8px 20px rgba(0,0,0,0.1); border-radius: 12px;" 
                size="huge" :bordered="false">
          <h2 style="
            font-weight: 800;
            font-size: 26px;
            background: linear-gradient(90deg, #ff7eb9, #ff758c);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            text-align: center;
            margin-bottom: 10px;
          ">
            任务队列
          </h2>
          <a href="/" style="position:absolute; top:20px; left:20px; color:#ff7eb9; font-weight:600; text-decoration:none;">返回主页</a>
          <!-- 隐私模式开关 -->
          <div style="position:absolute; top:20px; right:20px; display:flex; align-items:center; gap:12px;">
            <div style="display:flex; align-items:center; gap:6px;">
              <span style="font-size:14px; color:#ff7eb9; font-weight:600;">隐私模式</span>
              <n-switch v-model:value="privacyMode" size="small"/>
            </div>
          </div>

          <!-- 顶部操作区 -->
          <n-space justify="space-between" align="center" style="margin-bottom: 20px;">
            <div style="display: flex; gap: 12px; align-items: center;">
              <n-button type="primary" size="small" :disabled="checkedRowKeys.length===0" @click="batchDownload">
                批量下载 ({{ checkedRowKeys.length }})
              </n-button>
              <div style="display:flex; align-items:center; gap:6px;">
                <span style="font-size:14px; color:#ff7eb9; font-weight:600;">自动刷新</span>
                <n-switch v-model:value="autoRefresh" size="small"/>
              </div>
              <!-- 批量操作按钮 -->
              
            </div>
            <n-text depth="3">共 {{ total }} 个任务</n-text>
          </n-space>
  
          <!-- 数据表 -->
          <n-data-table
            :columns="task_columns()"
            :data="tasks"
            :bordered="true"
            :single-line="false"
            :loading="loading"
            size="medium"
            :key="dataTableKey"
            style="border-radius: 8px;"
            v-model:checked-row-keys="checkedRowKeys"
            :row-key="rowKey"
          ></n-data-table>

          <!-- 单独分页 -->
          <div style="display:flex; justify-content:right; margin-top: 20px;">
            <n-pagination
              v-model:page="page"
              v-model:page-size="perPage"
              :item-count="total"
              show-size-picker
              :page-sizes="[20, 50, 100]"
              @update:page="loadTasks"
              @update:page-size="(size) => { perPage = size; page = 1; loadTasks(); }"
            />
          </div>
  
          <!-- 弹窗: 错误详情 -->
          <n-modal v-model:show="showErrorModal" preset="dialog" title="错误详情" style="max-width: 500px;">
            <div style="max-height: 400px; overflow-y: auto; white-space: pre-wrap; padding: 10px; line-height: 1.5; color: #333;">
              {{ currentError }}
            </div>
          </n-modal>
  
          <!-- 弹窗: 任务ID详情 -->
          <n-modal v-model:show="showIdModal" preset="dialog" title="详情" style="max-width: 500px;">
            <div style="max-height: 400px; overflow-y: auto; white-space: pre-wrap; padding: 10px; line-height: 1.5; color: #333;">
              {{ currentId }}
            </div>
          </n-modal>
        </n-card>
        <!-- 插入弹窗组件 -->
        <component :is="JmDetailModal"/>
        <component :is="JmBottomBarComponent"/>
      </div>
    `,
        setup() {
            const tasks = ref([])
            const total = ref(0)
            const page = ref(1)
            const perPage = ref(20)
            const loading = ref(false)
            const dataTableKey = ref('key_')

            const checkedRowKeys = ref([]) // ✅ 存储选中的任务 ID
            const showErrorModal = ref(false)
            const showIdModal = ref(false)
            const currentError = ref('')
            const currentId = ref('')
            const message = useMessage()
            const loadingBar = useLoadingBar()

            const privacyMode = ref(localStorage.getItem('privacyMode') === 'true')


            const autoRefresh = ref(false)
            let refreshTimer = null
            watch(autoRefresh, (val) => {
                if (val) {
                    refreshTimer = setInterval(() => loadTasks(), 2500)
                } else {
                    if (refreshTimer) clearInterval(refreshTimer)
                }
                localStorage.setItem('autoRefresh', val)
            })
            autoRefresh.value = localStorage.getItem('autoRefresh') === 'true'
            onBeforeUnmount(() => {
                if (refreshTimer) clearInterval(refreshTimer)
            })

            const JmDetailModal = createJmDetailModal(naive, privacyMode)
            const JmBottomBarComponent = createJmBottomBarComponent(naive, privacyMode)

            const openErrorModal = (msg) => {
                currentError.value = msg
                showErrorModal.value = true
            }
            const openIdModal = (msg) => {
                currentId.value = msg
                showIdModal.value = true
            }

            const retryTask = async (row) => {
                message.info('下载任务重新进入队列')
                loadingBar.start()
                const res = await retryById([row.task_id])
                if (res.code === 200) {
                    loadingBar.finish()
                    setTimeout(() => {
                        window.location.href = '/admins/pages'
                    }, 1000)
                } else {
                    loadingBar.error()
                    message.error(res.message || '重试任务失败')
                }
            }

            // ✅ 批量下载方法
            const batchDownload = async () => {
                if (checkedRowKeys.value.length === 0) {
                    message.warning("请先选择任务")
                    return
                }

                try {
                    loadingBar.start()
                    const url = "/api/downloads/zip_download?folder_names=" + checkedRowKeys.value.join(',')
                    const res = await fetch(url)
                    if (!res.ok) throw new Error('下载失败')

                    const now = new Date()
                    const pad = (n) => String(n).padStart(2, '0')
                    const timestamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`
                    let filename = `下载bot酱批量下载喵_${timestamp}.zip` // 默认文件名

                    const blob = await res.blob()
                    const downloadUrl = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = downloadUrl
                    a.download = filename
                    document.body.appendChild(a)
                    a.click()
                    document.body.removeChild(a)
                    URL.revokeObjectURL(downloadUrl)
                    loadingBar.finish()
                } catch (err) {
                    loadingBar.error()
                    message.error(err.message || '下载失败')
                }
            }


            const rowKey = (row) => row.item_id // 唯一标识每一行

            let columns = [
                {type: 'selection', width: 60}, // ✅ 多选框列
                {
                    title: 'JM_ID',
                    align: 'center',
                    render(row) {
                        const shortText = row.result.item_id
                        return h('p', {
                            style: {cursor: 'pointer', color: '#ff7eb9'},
                            onClick: () => JmDetailModal.setup().showDetail(row.result.item_id)
                        }, shortText)
                    }
                },
                {
                    title: '名称',
                    key: 'name',
                    align: 'center',
                    render(row) {
                        return h('div', {
                            style: {
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                color: '#ff7eb9',width: '350px'
                            },
                            onClick: () => JmDetailModal.setup().showDetail(row.result.item_id)
                        }, row.name)
                    }
                },
                {
                    title: '状态',
                    key: 'status',
                    align: 'center',
                    render(row) {
                        let status = '失败'
                        let color = 'red'
                        if (row.status === 'SUCCESS') {
                            status = '已完成'
                            color = '#ff7eb9'
                        } else if (row.status === 'RUNNING') {
                            status = '进行中'
                            color = '#409EFF'
                        }
                        return h('span', {style: {color, fontWeight: 500}}, status)
                    }
                },
                {
                    title: '下载进度',
                    key: 'progress',
                    width: 150,
                    align: 'center',
                    render(row) {
                        let finished = row.finished_count || 0
                        const total = row.total_count || 0
                        if (row.status === 'SUCCESS') {
                            finished = total
                        }
                        const percent = total > 0 ? Math.floor((finished / total) * 100) : 0
                        return h(NProgress, {
                            percentage: percent,
                            type: 'line',
                            indicatorPlacement: "inside",
                            color: "#ff7eb9",
                            width: '300px',
                            processing: true
                        })
                    }
                },
                {
                    title: '完成时间',
                    key: 'end_time',
                    align: 'center',
                    render(row) {
                        if (!row.end_time) return '--'
                        const d = new Date(row.end_time)
                        const text = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`
                        return h('span', {
                            target: '_blank',
                            style: {color: '#ff7eb9', 'text-decoration': 'none'}
                        }, text)
                    }
                },
                {
                    title: '操作',
                    key: 'action',
                    align: 'center',
                    render(row) {
                        if (row.status !== 'SUCCESS') {
                            return h(NButton, {
                                type: 'text',
                                size: 'small',
                                style: {color: '#409EFF', cursor: 'pointer'},
                                onClick: () => retryTask(row)
                            }, '重试')
                        } else {
                            return h(NButton, {
                                type: 'text',
                                size: 'small',
                                style: {color: '#409EFF', cursor: 'pointer'},
                                onClick: async () => {
                                    try {
                                        loadingBar.start()
                                        const url = window.location.origin + '/api/jm/download_file/' + row.item_id + ".zip"
                                        const res = await fetch(url)
                                        if (!res.ok) throw new Error('下载失败')

                                        // 生成时间戳文件名
                                        const filename = `${row.name}.zip`

                                        const blob = await res.blob()
                                        const downloadUrl = URL.createObjectURL(blob)
                                        const a = document.createElement('a')
                                        a.href = downloadUrl
                                        a.download = filename
                                        document.body.appendChild(a)
                                        a.click()
                                        document.body.removeChild(a)
                                        URL.revokeObjectURL(downloadUrl)
                                        loadingBar.finish()
                                    } catch (err) {
                                        loadingBar.error()
                                        message.error(err.message || '下载失败')
                                    }
                                }
                            }, '下载')
                        }
                    }
                }
            ]
            const task_columns = () =>{
                if(privacyMode.value){
                    columns = columns.filter(item => item.key !== 'name')
                }else{
                    columns = temp_columns
                }
                return columns
            }
            const temp_columns = columns
            watch(privacyMode, (val) => {
                localStorage.setItem('privacyMode', val)
                dataTableKey.value = 'key_' + Math.random()
            })
            const loadTasks = async () => {
                loading.value = true
                try {
                    loadingBar.start()
                    const res = await fetchTasks(page.value, perPage.value)
                    const data = res.data || res
                    loadingBar.finish()
                    tasks.value = data.items || []
                    total.value = data.total || 0
                } catch (err) {
                    loadingBar.error()
                    console.error('加载任务失败', err)
                    tasks.value = []
                    total.value = 0
                } finally {
                    loading.value = false
                }
            }

            loadTasks()

            return {
                tasks,
                total,
                page,
                perPage,
                loading,
                columns,
                loadTasks,
                showErrorModal,
                showIdModal,
                currentId,
                currentError,
                themeOverrides,
                loadingBar,
                JmBottomBarComponent,
                JmDetailModal,
                privacyMode,
                autoRefresh,
                checkedRowKeys,
                rowKey,
                task_columns,
                dataTableKey,
                batchDownload
            }
        },
        components: {NCard, NSpace, NButton, NText, NDataTable, NModal, NPagination, NSwitch, NProgress}
    }
}
