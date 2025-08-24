import { fetchTasks } from '../api/taskService.js'

export function createTaskTable(Vue, naive) {
  const { ref, h } = Vue
  const { NCard, NSpace, NButton, NText, NDataTable } = naive

  return {
    template: `
      <n-card title="任务队列" size="huge" :bordered="false">
        <n-space justify="space-between" align="center" style="margin-bottom: 15px;">
          <div style="display: flex; gap: 10px;">
            <n-button type="primary" @click="openDownloadPage">下载本子</n-button>
            <n-button type="primary" @click="loadTasks" :loading="loading">刷新</n-button>
          </div>
          <n-text depth="3">共 {{ tasks.length }} 个任务</n-text>
        </n-space>

        <n-data-table 
          :columns="columns" 
          :data="tasks" 
          :bordered="true" 
          :single-line="false">
        </n-data-table>
      </n-card>
    `,
    setup() {
      const tasks = ref([])
      const loading = ref(false)

      const columns = [
        { title: '任务ID', key: 'task_id' },
        {
          title: '状态',
          key: 'status',
          render(row) {
            return h('span', { style: { color: row.status === 'SUCCESS' ? 'green' : 'red' } }, row.status)
          }
        },
        { title: '完成时间', key: 'date_done' },
        {
          title: '结果',
          key: 'result',
          render(row) {
            if (row.result && row.result.url) {
              const baseUrl = window.location.origin + '/'
              const fullUrl = baseUrl + row.result.url
              return h('a', { href: fullUrl, target: '_blank' }, row.result.item_id || '查看')
            }
            return null
          }
        }
      ]

      const loadTasks = async () => {
        loading.value = true
        tasks.value = await fetchTasks()
        loading.value = false
      }

      const openDownloadPage = () => {
        window.open('/admins/pages/download.html', '_blank')
      }

      loadTasks()

      return { tasks, loading, columns, loadTasks, openDownloadPage }
    },
    components: { NCard, NSpace, NButton, NText, NDataTable }
  }
}
