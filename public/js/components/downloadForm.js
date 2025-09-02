import {downloadById} from '../api/downloadService.js'
import {themeOverrides} from '../utils/theme.js'
import {createJmDetailModal} from '/public/js/model/JmDetailModal.js'
import {createJmBottomBarComponent} from '/public/js/model/JmBottomBarComponent.js'
export function createDownloadForm(Vue, naive) {
    const {ref, computed, watch} = Vue
    const {NCard, NInput, NButton, NTag, NConfigProvider, NTooltip, useMessage, useLoadingBar} = naive
    const privacyMode = ref(localStorage.getItem('privacyMode') === 'true')
    watch(privacyMode, val => localStorage.setItem('privacyMode', val))
    const JmDetailModal = createJmDetailModal(naive, privacyMode)
    const JmBottomBarComponent= createJmBottomBarComponent(naive,privacyMode)
    return {
        template: `
      <div style="display: flex; justify-content: center; gap: 30px; margin-top: 200px;">
        <a href="https://github.com/Kiliwwwww/download_bot" target="_blank" style="color: #ff7eb9;text-decoration: none;width: 260px; height: 340px;">
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
               <img src="/public/img/searchlogo.png" style="height: 50px"/>
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
                  @close="removeId(index)"
                  >
<!--                  <template #avatar>-->
<!--                    <n-avatar color="transparent" src="/public/img/book.svg"/>-->
<!--                  </template>-->

                  <a href="#" style="all: unset;cursor: pointer;color: inherit; text-decoration: none;" @click="JmDetailModal.setup().showDetail(id)">{{ id }}</a>
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
              <!-- 修改后的按钮区域，添加了浮动效果和更好的布局 -->
              <div style="display: flex; justify-content: center; gap: 10px; flex-wrap: wrap; width: 50%;">
                  <n-button
                      size="medium"
                      style="width: 160px; padding: 10px 20px; font-weight: 600; font-size: 15px; color: #fff; border-radius: 10px; background: linear-gradient(90deg, #ff7eb9 20%, #ff758c 80%); box-shadow: 0 6px 12px rgba(0,0,0,0.15); transition: all 0.2s ease; border: none; cursor: pointer;"
                      @click="showMoreModal = true"
                    >
                      更多下载 🐳
                    </n-button>
                    <!-- 弹窗 -->
                    <n-modal
                  v-model:show="showMoreModal"
                  preset="card"
                  :style="{
                    width: '420px',
                    borderRadius: '20px',
                    padding: '24px',
                    background: 'linear-gradient(180deg, #fff 60%, #fff0f6 100%)',
                    boxShadow: '0 12px 28px rgba(0,0,0,0.15)'
                  }"
                >
                  <template #header>
                    <h3
                      style="
                        margin: 0;
                        font-weight: 800;
                        font-size: 22px;
                        text-align: center;
                        background: linear-gradient(90deg,#ff7eb9,#ff758c);
                        -webkit-background-clip: text;
                        -webkit-text-fill-color: transparent;
                      "
                    >
                      更多下载选项
                    </h3>
                  </template>
                
                  <div style="display:flex; flex-wrap:wrap; gap:16px; justify-content:center; margin-top:20px;">
                    <n-button
                      v-for="btn in moreBtns"
                      :key="btn.label"
                      size="large"
                      style="
                        flex:1 1 40%;
                        min-width: 140px;
                        height: 48px;
                        font-weight: 600;
                        font-size: 15px;
                        color: #fff;
                        border-radius: 14px;
                        background: linear-gradient(90deg,#ff7eb9 20%,#ff758c 80%);
                        box-shadow: 0 4px 10px rgba(0,0,0,0.12);
                        border: none;
                        transition: all 0.25s ease;
                        transform: scale(1);
                      "
                      @click="goToList(btn.type)"
                      @mouseover="hover = btn.label"
                      @mouseleave="hover = ''"
                      :style="hover === btn.label ? {
                        transform: 'scale(1.06) translateY(-4px)',
                        boxShadow: '0 10px 20px rgba(0,0,0,0.18)'
                      } : {}"
                    >
                      {{ btn.label }}
                    </n-button>
                  </div>
                </n-modal>

              </div>

            </div>
          </n-card>

          <p style="margin-top: 10px; font-size: 14px; color: #ff7eb9; text-align: center; line-height: 1.6; max-width: 500px;">
             大家好（ﾉ>ω<)ﾉ 这里是下载bot酱网页版！<br>
             可下载JMComic内的漫画，欢迎大家来测试！<br>
             小提示: 只能用JMComic地址上的数字id下载<br>
             如果大家觉得好用的话就请麻烦宣传和赞助一下！<br>
             PS.目前只能下载JMComic内的漫画呀！别的网站的暂时未收录<br>
             <br>
             <a href="/admins/pages" style="font-weight: 500;">前往任务队列 →</a>&nbsp&nbsp&nbsp&nbsp
             <a href="/admins/pages/search.html" style="font-weight: 500;">前往搜索页面 →</a><br>
          </p>
        </div>
        <!-- 插入弹窗组件 -->
        <component :is="JmDetailModal"/>
        <component :is="JmBottomBarComponent"/>
      </div>
    `,
        setup() {
            const inputId = ref('')
            const savedIds = ref([])
            const hoverImg = ref(false)
            const hoverCard = ref(false)
            const hoverBtn = ref(false)
            const pressTimer = ref(null)
            const message = useMessage()
            const showMoreModal = ref(false)
            const hover = ref('')
            const moreBtns = ref([
                {label: '最新漫画', type: 'last'},
                {label: '游览最高', type: 'view'},
                {label: '点赞最多', type: 'like'},
                {label: '最多图片', type: 'picture'}
            ])
            const loadingBar = useLoadingBar()
            const goToList = (type) => {
                window.location.href = `/admins/pages/jm_list_page.html?type=${type}`
            }

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
                message.loading('（ﾉ>ω<)ﾉ长按一坤秒下载本子!!!', {showIcon: false})


                hoverBtn.value = true
                pressTimer.value = setTimeout(() => {
                    hoverBtn.value = false
                    loadingBar.start()
                    message.info('下载任务进入队列')
                    downloadById(savedIds.value).then(res => {
                        if (res.code === 200) {
                            loadingBar.finish()
                            setTimeout(() => window.location.href = '/admins/pages', 1000)
                        } else {
                            loadingBar.error()
                            message.error(res.message || '下载失败')
                        }
                    })
                }, 2500) // 长按 1.5 秒
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
                filterNumber,
                showMoreModal,
                hover,
                moreBtns,
                goToList,
                loadingBar,
                JmDetailModal,
                JmBottomBarComponent
            }
        },
        components: {NCard, NInput, NButton, NTag, NConfigProvider, NTooltip}
    }
}
