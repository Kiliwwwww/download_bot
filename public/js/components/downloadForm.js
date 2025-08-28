import {downloadById} from '../api/downloadService.js'
import {themeOverrides} from '../utils/theme.js'

export function createDownloadForm(Vue, naive) {
    const {ref, computed} = Vue
    const {NCard, NInput, NButton, NTag, NConfigProvider, NTooltip, useMessage} = naive

    return {
        template: `
    <n-config-provider :theme-overrides="themeOverrides">
      <div style="display: flex; justify-content: center; gap: 30px; margin-top: 200px;">
        <a href="https://github.com/Kiliwwwww/download_bot" target="_blank" style="color: #ff7eb9;text-decoration: none;">
            <img
              src="/public/img/logo.webp"
              alt="logo"
              style="width: 260px; height: 340px; object-fit: cover; border-radius: 16px; box-shadow: 0 8px 20px rgba(0,0,0,0.15); transition: transform 0.3s;"
              @mouseover="hoverImg = true"
              @mouseleave="hoverImg = false"
              :style="{ transform: hoverImg ? 'scale(1.03)' : 'scale(1)' }"
            />
        </a>

        <div style="display: flex; flex-direction: column; align-items: center; gap: 15px;">
          <n-card 
            :style="cardStyle"
            @mouseover="hoverCard = true"
            @mouseleave="hoverCard = false"
          >
            <div style="display: flex; flex-direction: column; align-items: center; gap: 20px; width: 100%;">
              <h2 style="
                font-weight: 800;
                font-size: 26px;
                background: linear-gradient(90deg, #ff7eb9, #ff758c);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                text-align: center;
                margin-bottom: 10px;
              ">
                下载bot酱
              </h2>

              <n-input
                v-model:value="inputId"
                placeholder="请输入ID，按回车保存"
                @keyup.enter="handleEnter"
                @blur="handleEnter"
                @input="filterNumber" 
                style="width: 80%; font-size: 15px; border-radius: 8px; padding: 8px 12px;"
              ></n-input>

              <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; width: 100%;">
                <n-tag
                  v-for="(id, index) in savedIds"
                  :key="id"
                  closable
                  :color="{ color: '#fff', borderColor: '#ff7eb9', textColor: '#ff7eb9' }"
                  style="padding: 4px 10px; border-radius: 6px;"
                  @close="removeId(index)">
                  <template #avatar>
                    <n-avatar color="transparent" src="/public/img/book.svg"/>
                  </template>
                  {{ id }}
                </n-tag>
              </div>

              <n-button
                    size="medium"
                    @mousedown="startPress"
                    @mouseup="cancelPress"
                    @mouseleave="cancelPress"
                    :class="{ 'shake': hoverBtn }"
                    style="width: 160px; padding: 10px 20px; font-weight: 600; font-size: 15px; color: #fff; border-radius: 10px; background: linear-gradient(90deg, #ff7eb9 20%, #ff758c 80%); box-shadow: 0 6px 12px rgba(0,0,0,0.15); transition: all 0.2s ease; border: none; cursor: pointer;"
                    @mouseover="hoverBtn = true"
                    @mouseleave="hoverBtn = false">
                    开始下载 🎉
                  </n-button>

            </div>
          </n-card>

          <p style="margin-top: 10px; font-size: 14px; color: #ff7eb9; text-align: center; line-height: 1.6; max-width: 500px;">
             大家好（ﾉ>ω<)ﾉ 这里是下载bot酱网页版！<br>
             可下载JMComic内的本子，欢迎大家来测试！<br>
             小提示: 只能用JMComic地址上的数字id下载<br>
             如果大家觉得好用的话就请麻烦宣传和赞助一下！<br>
             PS.目前只能下载JMComic内的本子呀！别的网站的暂时未收录<br>
             <br>
             <a href="/admins/pages" style="font-weight: 500;">前往任务队列 →</a><br>
          </p>

        </div>
      </div>
    </n-config-provider>
    `,
        setup() {
            const inputId = ref('')
            const savedIds = ref([])
            const hoverImg = ref(false)
            const hoverCard = ref(false)
            const hoverBtn = ref(false)
            const pressTimer = ref(null)
            const message = useMessage()
            const handleEnter = () => {
                const id = inputId.value.trim()
                if (!id) {
                    // message.warning('ID不能为空')
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

            const filterNumber = (value) => {
                inputId.value = value.replace(/\D/g, '')
            }

            const startPress = () => {

                setTimeout(() => {
                }, 100)

                if (!savedIds.value.length) {
                    return
                }
                message.loading('（ﾉ>ω<)ﾉ长按五秒下载本子!!!', {showIcon: false})


                hoverBtn.value = true
                pressTimer.value = setTimeout(() => {
                    hoverBtn.value = false
                    message.info('下载任务进入队列')
                    downloadById(savedIds.value).then(res => {
                        if (res.code === 200) {
                            setTimeout(() => window.location.href = '/admins/pages', 1000)
                        } else {
                            message.error(res.message || '下载失败')
                        }
                    })
                }, 5000) // 长按 1.5 秒
            }

            const cancelPress = () => {
                hoverBtn.value = false
                if (pressTimer.value) {
                    clearTimeout(pressTimer.value)
                    pressTimer.value = null
                }
            }

            const cardStyle = computed(() => ({
                width: '500px',
                minHeight: '340px',
                padding: '20px',
                borderRadius: '12px',
                backgroundColor: '#fff',
                boxShadow: hoverCard.value
                    ? '0 16px 30px rgba(0,0,0,0.18)'
                    : '0 8px 20px rgba(0,0,0,0.15)',
                transform: hoverCard.value ? 'scale(1.03)' : 'scale(1)',
                transition: 'all 0.3s ease'
            }))

            return {
                inputId,
                savedIds,
                hoverImg,
                hoverCard,
                hoverBtn,
                handleEnter,
                removeId,
                startPress,
                cancelPress,
                cardStyle,
                themeOverrides,
                filterNumber
            }
        },
        components: {NCard, NInput, NButton, NTag, NConfigProvider, NTooltip}
    }
}
