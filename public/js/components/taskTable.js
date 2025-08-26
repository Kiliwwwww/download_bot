import {fetchTasks} from '../api/taskService.js' // ✅ 使用相对路径，确保加载的是修改后的文件

export function createTaskTable(Vue, naive) {
    const { ref, h, computed } = Vue
    const { NCard, NSpace, NButton, NText, NDataTable, NModal } = naive

    return {
        template: `
      <n-card title="任务队列" size="huge" :bordered="false">
        <n-space justify="space-between" align="center" style="margin-bottom: 15px;">
          <div style="display: flex; gap: 10px;">
            <n-button type="primary" @click="openDownloadPage">下载本子</n-button>
            <n-button type="primary" @click="loadTasks" :loading="loading">刷新</n-button>
          </div>
          <n-text depth="3">共 {{ total }} 个任务</n-text>
        </n-space>

        <n-data-table 
          :columns="columns" 
          :data="tasks" 
          :bordered="true" 
          :single-line="false"
          :pagination="pagination"
          :loading="loading">
        </n-data-table>

        <n-modal v-model:show="showErrorModal" preset="dialog" title="错误详情">
          <div style="max-height: 400px; overflow-y: auto; white-space: pre-wrap;">
            {{ currentError }}
          </div>
        </n-modal>
        <n-modal v-model:show="showIdModal" preset="dialog" title="详情">
          <div style="max-height: 400px; overflow-y: auto; white-space: pre-wrap;">
            {{ currentId }}
          </div>
        </n-modal>
      </n-card>
    `,
        setup() {
            const tasks = ref([])
            const total = ref(0)
            const page = ref(1)
            const perPage = ref(10)
            const loading = ref(false)
            const task_id_max_size = 8
            // 弹窗状态
            const showErrorModal = ref(false)
            const showIdModal = ref(false)
            const currentError = ref("")
            const currentId = ref("")

            const openErrorModal = (msg) => {
                currentError.value = msg
                showErrorModal.value = true
            }

            const openIdModal = (msg) => {
                currentId.value = msg
                showIdModal.value = true
            }

            const columns = [
                {
                    title: '任务ID',
                    key: 'task_id',
                    render(row) {
                        const shortText = row.task_id.length > task_id_max_size ? row.task_id.slice(0, task_id_max_size) : row.task_id
                        return h(
                            'span',
                            {
                                    onClick: () => openIdModal("任务ID:  "+row.task_id)
                            },
                            shortText
                        )
                    }
                },
                {
                    title: '状态',
                    key: 'status',
                    render(row) {
                        return h(
                            'span',
                            { style: { color: row.status === 'SUCCESS' ? 'green' : 'red' } },
                            row.status === "SUCCESS" ? "已结束" : "失败"
                        )
                    }
                },
                {
                        title: '开始时间',
                        key: 'start_time',
                        render(row) {
                            if (!row.start_time) return ''
                            const start_time = new Date(row.start_time)
                            // 格式化成 YYYY-MM-DD HH:mm:ss
                            return start_time.getFullYear() + '-' +
                                String(start_time.getMonth() + 1).padStart(2, '0') + '-' +
                                String(start_time.getDate()).padStart(2, '0') + ' ' +
                                String(start_time.getHours()).padStart(2, '0') + ':' +
                                String(start_time.getMinutes()).padStart(2, '0') + ':' +
                                String(start_time.getSeconds()).padStart(2, '0')
                        }
                },
                {
                        title: '完成时间',
                        key: 'end_time',
                        render(row) {
                            if (!row.end_time) return ''
                            const end_time = new Date(row.end_time)
                            // 格式化成 YYYY-MM-DD HH:mm:ss
                            return end_time.getFullYear() + '-' +
                                String(end_time.getMonth() + 1).padStart(2, '0') + '-' +
                                String(end_time.getDate()).padStart(2, '0') + ' ' +
                                String(end_time.getHours()).padStart(2, '0') + ':' +
                                String(end_time.getMinutes()).padStart(2, '0') + ':' +
                                String(end_time.getSeconds()).padStart(2, '0')
                        }
                },
                {
                    title: '结果',
                    key: 'result',
                    render(row) {
                        if (row.result && row.result.error) {
                            const text = row.result.error
                            const shortText = text.length > 30 ? text.slice(0, 30) + "..." : text
                            return h(
                                'span',
                                {
                                    style: { color: 'red', cursor: 'pointer', textDecoration: 'underline' },
                                    onClick: () => openErrorModal(text)
                                },
                                shortText
                            )
                        } else if (row.result && row.result.url) {
                            const fullUrl = window.location.origin + '/' + row.result.url
                            return h('a', { href: fullUrl, target: '_blank' }, row.result.item_id || '查看')
                        }
                        return null
                    }
                }
            ]

            const loadTasks = async () => {
                console.log("loadTasks called", page.value, perPage.value)
                loading.value = true
                const res = await fetchTasks(page.value, perPage.value)
                console.log("fetch result", res)
                tasks.value = res.items || []
                total.value = res.total || 0
                loading.value = false
            }

            const pagination = computed(() => ({
                page: page.value,
                pageSize: perPage.value,
                itemCount: total.value,
                showSizePicker: true,
                pageSizes: [10, 20, 50],
                onChange: (newPage) => {
                    page.value = newPage
                    loadTasks()
                },
                onUpdatePageSize: (newSize) => {
                    perPage.value = newSize
                    page.value = 1
                    loadTasks()
                }
            }))

            const openDownloadPage = () => {
                window.open('/admins/pages/download.html', '_blank')
            }

            loadTasks()  // 首次加载

            return {
                tasks,
                total,
                loading,
                columns,
                pagination,
                loadTasks,
                openDownloadPage,
                showErrorModal,
                showIdModal,
                currentId,
                currentError
            }
        },
        components: { NCard, NSpace, NButton, NText, NDataTable, NModal }
    }
}
