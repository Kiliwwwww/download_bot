// downloadForm.js
import {downloadById} from '../api/downloadService.js'

export function createDownloadForm(Vue, naive) {
    const {ref, computed} = Vue
    const {NCard, NInput, NButton, NSpace, NTag, useMessage} = naive

    return {
        template: `
    <div style="display: flex; justify-content: center; gap: 30px; margin-top: 200px;">
    
      <!-- 左侧图片 -->
      <img
        src="/public/logo.png"
        alt="logo"
        style="width: 260px; height: 340px; object-fit: cover; border-radius: 16px; box-shadow: 0 8px 20px rgba(0,0,0,0.15); transition: transform 0.3s;"
        @mouseover="hoverImg = true"
        @mouseleave="hoverImg = false"
        :style="{ transform: hoverImg ? 'scale(1.03)' : 'scale(1)' }"
      />
    
      <!-- 右侧容器（Card + Link） -->
      <div style="display: flex; flex-direction: column; align-items: center; gap: 15px;">
    
        <!-- Card -->
        <n-card 
          :style="cardStyle"
          @mouseover="hoverCard = true"
          @mouseleave="hoverCard = false"
        >
          <h2 style="margin-bottom: 20px; font-weight: 600; color: #333;">下载工具</h2>
    
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
    
            <!-- 下载按钮 -->
            <n-space justify="start" style="margin-top: 10px;">
              <n-button type="primary" size="medium" @click="handleDownload">下载</n-button>
            </n-space>
          </n-space>
        </n-card>
    
        <!-- Card 外部 link -->
        <a href="/admins/pages" style="color: #409eff; text-decoration: none; font-weight: 500;">前往历史记录 →</a>
    
      </div>
    </div>


    `,
        setup() {
            const inputId = ref('')
            const savedIds = ref([])
            const hoverImg = ref(false)
            const hoverCard = ref(false)
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
                const res = await downloadById(savedIds.value)
                if (res.code === 200) {
                    setTimeout(() => {
                        window.location.href = '/admins/pages'
                    }, 1000)
                } else {
                    message.error(res.message || '下载失败')
                }
            }

            const cardStyle = computed(() => ({
                width: '500px',
                height: '340px',
                padding: '20px',
                borderRadius: '12px',
                backgroundColor: '#fff',
                boxShadow: hoverCard.value
                    ? '0 16px 30px rgba(0,0,0,0.18)'
                    : '0 8px 20px rgba(0,0,0,0.15)',
                transform: hoverCard.value ? 'scale(1.03)' : 'scale(1)',
                transition: 'all 0.3s ease'
            }))


            return {inputId, savedIds, hoverImg, hoverCard, handleEnter, removeId, handleDownload, cardStyle}
        },
        components: {NCard, NInput, NButton, NSpace, NTag}
    }
}
