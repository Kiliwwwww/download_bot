// downloadForm.js
import {downloadById} from '../api/downloadService.js'

export function createDownloadForm(Vue, naive) {
    const {ref} = Vue
    const {NCard, NInput, NButton, NSpace, NTag, useMessage} = naive

    return {
        template: `
    <div style="display: flex; justify-content: center; margin-top: 60px;">
      <n-card style="width: 500px; padding: 30px; box-shadow: 0 8px 20px rgba(0,0,0,0.1); border-radius: 12px;">
        <h2 style="text-align: center; margin-bottom: 25px; font-weight: 600; color: #333;">下载本子</h2>
        <n-space vertical size="large" style="width: 100%;">
          
          <!-- 输入框 -->
          <n-input
            v-model:value="inputId"
            placeholder="请输入ID，按回车保存"
            @keyup.enter="handleEnter"
            style="width: 100%; font-size: 14px;"
          ></n-input>

          <!-- 已保存的 ID 标签 -->
          <div style="display: flex; flex-wrap: wrap; gap: 8px;">
            <n-tag
              v-for="(id, index) in savedIds"
              :key="id"
              closable
              type="info"
              @close="removeId(index)"
            >
              {{ id }}
            </n-tag>
          </div>

          <!-- 操作按钮 -->
          <n-space justify="center" style="margin-top: 10px;">
            <n-button type="primary" size="medium" @click="handleDownload">下载</n-button>
            <n-button size="medium" @click="handleCancel">取消</n-button>
          </n-space>

        </n-space>
      </n-card>
    </div>
    `,
        setup() {
            const inputId = ref('')
            const savedIds = ref([])
            const message = useMessage()

            const handleEnter = () => {
                const id = inputId.value.trim()
                if (!id) {
                    message.warning('ID不能为空')
                    return
                }
                if (!savedIds.value.includes(id)) {
                    savedIds.value.push(id)
                }
                inputId.value = ''
            }

            const removeId = (index) => {
                savedIds.value.splice(index, 1)
            }

            const handleDownload = async () => {
                if (!savedIds.value.length) {
                    message.warning('请先输入至少一个ID')
                    return
                }
                message.info('下载任务进入队列')
                console.log(savedIds.value)
                const res = await downloadById(savedIds.value)
                if (res.code === 200) {
                  setTimeout(() => {
                    window.location.href = '/admins/pages'
                  }, 1000)
                } else {
                  message.error(res.message || '下载失败')
                }
            }

            const handleCancel = () => {
                window.location.href = '/admins/pages'
            }

            return {inputId, savedIds, handleEnter, removeId, handleDownload, handleCancel}
        },
        components: {NCard, NInput, NButton, NSpace, NTag}
    }
}
