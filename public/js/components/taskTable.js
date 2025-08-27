// taskTable.js
import {fetchTasks} from '../api/taskService.js'
import {themeOverrides} from '../utils/theme.js'

export function createTaskTable(Vue, naive) {
    const {ref, h} = Vue
    const {NCard, NSpace, NButton, NText, NDataTable, NModal, NPagination} = naive

    return {
        template: `
    <n-config-provider :theme-overrides="themeOverrides">
      <div style="display: flex; justify-content: center; margin-top: 50px;">
        <n-card style="width: 1100px; padding: 25px; box-shadow: 0 8px 20px rgba(0,0,0,0.1); border-radius: 12px;" 
                title="任务队列" size="huge" :bordered="false">
          
          <!-- 顶部操作区 -->
          <n-space justify="space-between" align="center" style="margin-bottom: 20px;">
            <div style="display: flex; gap: 12px;">
              <n-button type="primary" size="medium" @click="openDownloadPage">返回下载</n-button>
              <n-button type="primary" size="medium" :loading="loading" @click="loadTasks">刷新</n-button>
            </div>
            <n-text depth="3">共 {{ total }} 个任务</n-text>
          </n-space>
  
          <!-- 数据表 -->
          <n-data-table
            :columns="columns"
            :data="tasks"
            :bordered="true"
            :single-line="false"
            :loading="loading"
            size="medium"
            style="border-radius: 8px;"
          ></n-data-table>

          <!-- 单独分页 -->
          <div style="display:flex; justify-content:right; margin-top: 20px;">
            <n-pagination
              v-model:page="page"
              v-model:page-size="perPage"
              :item-count="total"
              show-size-picker
              :page-sizes="[10, 20, 50, 100]"
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
      </div>
    </n-config-provider>
    `,
        setup() {
            const tasks = ref([])
            const total = ref(0)
            const page = ref(1)
            const perPage = ref(10)
            const loading = ref(false)
            const task_id_max_size = 6

            const showErrorModal = ref(false)
            const showIdModal = ref(false)
            const currentError = ref('')
            const currentId = ref('')

            const openErrorModal = (msg) => {
                currentError.value = msg
                showErrorModal.value = true
            }

            const openIdModal = (msg) => {
                currentId.value = msg
                showIdModal.value = true
            }

            const retryTask = (row) => {
                alert('重试任务: ' + row.task_id)
            }

            const columns = [
                {
                    title: '任务ID',
                    key: 'task_id',
                    render(row) {
                        const shortText = row.task_id.length > task_id_max_size ? row.task_id.slice(0, task_id_max_size) : row.task_id
                        return h('span', {
                            style: {cursor: 'pointer', color: '#ff7eb9'},
                            onClick: () => openIdModal('任务ID:  ' + row.task_id)
                        }, shortText)
                    }
                },
                {
                    title: 'JM_ID',
                    render(row) {
                        const shortText = row.result.item_id
                        return h('a', {
                            style: {cursor: 'pointer', color: '#ff7eb9'},
                            href: 'https://18comic.vip/album/' + shortText
                        }, shortText)
                    }
                },
                {
                    title: '状态',
                    key: 'status',
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
                    title: '开始时间',
                    key: 'start_time',
                    render(row) {
                        if (!row.start_time) return ''
                        const d = new Date(row.start_time)
                        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`
                    }
                },
                {
                    title: '完成时间',
                    key: 'end_time',
                    render(row) {
                        if (!row.end_time) return ''
                        const d = new Date(row.end_time)
                        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`
                    }
                },
                {
                    title: '结果',
                    key: 'result',
                    render(row) {
                        if (row.result && row.result.error) {
                            const text = row.result.error
                            const shortText = text.length > 20 ? text.slice(0, 20) + '...' : text
                            return h('span', {
                                style: {color: 'red', cursor: 'pointer', textDecoration: 'underline'},
                                onClick: () => openErrorModal(text)
                            }, shortText)
                        } else if (row.result && row.result.url) {
                            const fullUrl = window.location.origin + '/' + row.result.url
                            return h('a', {
                                href: fullUrl,
                                target: '_blank',
                                style: {color: '#409EFF'}
                            }, row.result.item_id || '查看')
                        }
                        return null
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
                        }
                        return null
                    }
                }
            ]

            const loadTasks = async () => {
                loading.value = true
                try {
                    const res = await fetchTasks(page.value, perPage.value)
                    const data = res.data || res

                    tasks.value = data.items || []
                    total.value = data.total || 0
                } catch (err) {
                    console.error('加载任务失败', err)
                    tasks.value = []
                    total.value = 0
                } finally {
                    loading.value = false
                }
            }

            const openDownloadPage = () => {
                window.location.href = '/admins/pages/download.html'
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
                openDownloadPage,
                showErrorModal,
                showIdModal,
                currentId,
                currentError,
                themeOverrides
            }
        },
        components: {NCard, NSpace, NButton, NText, NDataTable, NModal, NPagination}
    }
}
