import {downloadById} from '../api/downloadService.js'

export function createDownloadForm(Vue, naive) {
    const {ref} = Vue
    const {NCard, NInput, NButton, NSpace, useMessage} = naive

    return {
        template: `
      <div style="max-width: 600px; margin: 50px auto;">
        <h1 style="text-align: center; margin-bottom: 30px;">下载本子</h1>
        <n-card>
          <n-space vertical size="large" style="width: 100%;">
            <n-input  v-model:value="inputId" placeholder="请输入ID"></n-input>
            <n-space>
              <n-button type="primary" @click="handleDownload">下载</n-button>
              <n-button @click="handleCancel">取消</n-button>
            </n-space>
          </n-space>
        </n-card>
      </div>
    `,
        setup() {
            const inputId = ref('')
            const message = useMessage()

            const handleDownload = async () => {
                if (!inputId.value.trim()) {
                    message.warning('请输入ID')
                    return
                }
                message.info('正在下载...')
                const res = await downloadById(inputId.value.trim())
                if (res.code === 200) {
                    message.success('下载完成')
                    setTimeout(() => {
                        window.location.href = '/index.html'
                    }, 1000)
                } else {
                    message.error(res.message || '下载失败')
                }
            }

            const handleCancel = () => {
                window.location.href = '/admins/pages'
            }

            return {inputId, handleDownload, handleCancel}
        },
        components: {NCard, NInput, NButton, NSpace}
    }
}
