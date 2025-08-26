// downloadForm.js
import { downloadById } from '../api/downloadService.js'

export function createDownloadForm(Vue, naive) {
  const { ref } = Vue
  const { NCard, NInput, NButton, NSpace, NTag, useMessage } = naive

  // 随机颜色函数
  const getRandomColor = () => {
    const colors = ['#f56c6c', '#e6a23c', '#67c23a', '#409eff', '#909399', '#ff69b4', '#00ced1']
    return colors[Math.floor(Math.random() * colors.length)]
  }

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

          <!-- 已保存的 ID 标签，添加动画 -->
          <transition-group name="tag-fade" tag="div" style="display: flex; flex-wrap: wrap; gap: 8px;">
            <n-tag
              v-for="(item, index) in savedIds"
              :key="item.id"
              closable
              :type="item.color"
              @close="removeId(index)"
            >
              {{ item.id }}
            </n-tag>
          </transition-group>

          <!-- 操作按钮 -->
          <n-space justify="center" style="margin-top: 10px;">
            <n-button type="primary" size="medium" @click="handleDownload">下载</n-button>
            <n-button size="medium" @click="handleCancel">取消</n-button>
          </n-space>

        </n-space>
      </n-card>
    </div>

    <!-- 动画样式 -->
    <style>
      .tag-fade-enter-active, .tag-fade-leave-active {
        transition: all 0.3s ease;
      }
      .tag-fade-enter-from {
        opacity: 0;
        transform: translateY(-10px);
      }
      .tag-fade-leave-to {
        opacity: 0;
        transform: translateY(10px);
      }
    </style>
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
        if (!savedIds.value.some(item => item.id === id)) {
          savedIds.value.push({ id, color: getRandomColor() })
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
        const res = await downloadById(savedIds.value.map(item => item.id))
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

      return { inputId, savedIds, handleEnter, removeId, handleDownload, handleCancel }
    },
    components: { NCard, NInput, NButton, NSpace, NTag }
  }
}
