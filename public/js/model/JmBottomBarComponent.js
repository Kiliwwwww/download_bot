// JmDetailModal.js

export function createJmBottomBarComponent(naive, privacyModeRef) {
    const {ref, onMounted, onBeforeUnmount, watch} = Vue
    const {NButton} = naive

    watch(privacyModeRef, val => localStorage.setItem('privacyMode', val))

    return {
        template: `
      <div style="position: fixed; bottom: 40px; right: 40px; display: flex; flex-direction: column; gap: 12px; z-index: 999;">
        <!-- 新增按钮组 -->
        <Transition name="extra-buttons">
          <div v-if="showExtraButtons" style="display:flex; flex-direction:column; gap:12px;">
            <n-tooltip placement="left" trigger="hover">
              <template #trigger>
                <n-button @click="goTo('/admins/pages/search.html')" title="搜索" class="bar-btn pink">🔍</n-button>
              </template>
              搜索
            </n-tooltip>
            <n-tooltip placement="left" trigger="hover">
              <template #trigger>
                <n-button @click="goTo('/admins/pages/jm_list_page.html?type=last')" title="搜索" class="bar-btn pink">📕</n-button>
              </template>
              漫画列表
            </n-tooltip>
            <n-tooltip placement="left" trigger="hover">
              <template #trigger>
                <n-button @click="goTo('/admins/pages')" title="队列" class="bar-btn pink">📥</n-button>
              </template>
              下载队列
            </n-tooltip>

            <n-tooltip placement="left" trigger="hover">
              <template #trigger>
                <n-button @click="goTo('/')" title="主页" class="bar-btn pink">🏠</n-button>
              </template>
              前往主页
            </n-tooltip>
          </div>
        </Transition>

        <!-- 隐私模式 -->
        <Transition name="extra-buttons">
          <div v-if="!showExtraButtons" style="display:flex; flex-direction:column; gap:12px;">
            <!-- 返回顶部 -->
            <n-tooltip placement="left" v-if="!showExtraButtons" trigger="hover">
              <template #trigger>
                <Transition name="fade">
                  <n-button
                    v-if="!showExtraButtons && !isTop"
                    @click="goTop"
                    title="返回顶部"
                    class="bar-btn"
                    @mouseover="hoverTopBtn=true" 
                    @mouseleave="hoverTopBtn=false"
                    :style="hoverTopBtn ? 'transform: scale(1.1); box-shadow:0 8px 18px rgba(0,0,0,0.25);' : ''"
                  >
                    ↑
                  </n-button>
                </Transition>
              </template>
              返回顶部
            </n-tooltip>

            <!-- 跳到底部 -->
            <n-tooltip placement="left" v-if="!showExtraButtons" trigger="hover">
              <template #trigger>
                <Transition name="fade">
                  <n-button
                    v-if="!showExtraButtons && !isBottom"
                    @click="goBottom"
                    title="跳到底部"
                    class="bar-btn pink"
                    @mouseover="hoverBtn=true" 
                    @mouseleave="hoverBtn=false"
                    :style="hoverBtn ? 'transform: scale(1.1); box-shadow:0 8px 18px rgba(0,0,0,0.25);' : ''"
                  >
                    ↓
                  </n-button>
                </Transition>
              </template>
              跳到底部
            </n-tooltip>

            <!-- 隐私模式切换 -->
            <n-tooltip placement="left" v-if="!showExtraButtons" trigger="hover">
              <template #trigger>
                <n-button
                  text
                  @click="togglePrivacy()"
                  title="开启隐私功能"
                  class="bar-btn pink"
                  :style="hoverPrivacyBtn ? 'transform: scale(1.1); box-shadow:0 8px 18px rgba(0,0,0,0.25);' : ''"
                  @mouseover="hoverPrivacyBtn=true" 
                  @mouseleave="hoverPrivacyBtn=false"
                >
                  <div style="display:flex; align-items:center; justify-content:center; width:100%; height:100%;">
                    <img
                      :src=" get_privacy() ? '/public/img/unlock.svg' : '/public/img/lock.svg'"
                      style="width:40%; height:40%; object-fit:contain; display:block;"
                    />
                  </div>
                </n-button>
              </template>
              {{ get_privacy() ? '关闭隐私模式' : '开启隐私模式' }}
            </n-tooltip>
          </div>
        </Transition>

        <!-- 下载 bot酱 -->
        <n-tooltip placement="left" trigger="hover">
          <template #trigger>
            <a href="javascript:;" @click="toggleBotButtons" title="下载bot酱">
              <img src="/public/img/logo.svg" class="bar-btn pink" />
            </a>
          </template>
          下载bot酱
        </n-tooltip>
      </div>
    `,
        setup() {
            const isTop = ref(true)
            const isBottom = ref(false)
            const hoverBtn = ref(false)
            const hoverTopBtn = ref(false)
            const hoverPrivacyBtn = ref(false)
            const localPrivacy = ref(false)
            localPrivacy.value = privacyModeRef.value
            const showExtraButtons = ref(false)

            const goBottom = () => window.scrollTo({top: document.body.scrollHeight, behavior: 'smooth'})
            const goTop = () => window.scrollTo({top: 0, behavior: 'smooth'})
            const handleScroll = () => {
                const scrollTop = window.scrollY
                const windowHeight = window.innerHeight
                const bodyHeight = document.body.scrollHeight
                isTop.value = scrollTop < 50
                isBottom.value = scrollTop + windowHeight >= bodyHeight - 50
            }
            const get_privacy = () => privacyModeRef.value
            const togglePrivacy = () => {
                privacyModeRef.value = !privacyModeRef.value
                localPrivacy.value = privacyModeRef.value
            }

            // 新增：切换下载bot酱按钮显示状态
            const toggleBotButtons = () => {
                showExtraButtons.value = !showExtraButtons.value
            }

            const goHome = () => window.location.href = '/'
            const goQueue = () => window.location.href = '/admins/pages'
            const goTo = (str) => window.location.href = str

            onMounted(() => {
                window.addEventListener('scroll', handleScroll)
                handleScroll() // 初始化状态
            })

            onBeforeUnmount(() => {
                window.removeEventListener('scroll', handleScroll)
            })

            return {
                isTop,
                isBottom,
                hoverBtn,
                hoverTopBtn,
                hoverPrivacyBtn,
                goBottom,
                goTop,
                handleScroll,
                togglePrivacy,
                get_privacy,
                showExtraButtons,
                toggleBotButtons,
                goHome,
                goQueue,
                goTo
            }
        },
        components: {NButton}
    }
}
