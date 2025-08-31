// JmDetailModal.js

export function createJmBottomBarComponent(naive, privacyModeRef) {
    const {ref, onMounted, onBeforeUnmount} = Vue
    const { NButton } = naive

    return {
        template: `
        <div style="position: fixed; bottom: 40px; right: 40px; display: flex; flex-direction: column; gap: 12px; z-index: 999;">
              <Transition name="fade">
                <n-button
                  v-if="!isTop"
                  @click="goTop"
                  title="返回顶部"
                  style="width:50px; height:50px; border-radius:25px; background: linear-gradient(135deg, #7ebfff, #758cff); color:#fff; font-size:22px; font-weight:700; box-shadow:0 6px 14px rgba(0,0,0,0.2); transition: transform 0.2s;"
                  @mouseover="hoverTopBtn=true" @mouseleave="hoverTopBtn=false"
                  :style="hoverTopBtn ? 'transform: scale(1.1); box-shadow:0 8px 18px rgba(0,0,0,0.25);' : ''"
                >
                  ↑
                </n-button>
              </Transition>
              <!-- 跳到底部 -->
              <Transition name="fade">
                <n-button
                  v-if="!isBottom"
                  @click="goBottom"
                  title="跳到底部"
                  style="width:50px; height:50px; border-radius:25px; background: linear-gradient(135deg, #ff7eb9, #ff758c); color:#fff; font-size:22px; font-weight:700; box-shadow:0 6px 14px rgba(0,0,0,0.2); transition: transform 0.2s;"
                  @mouseover="hoverBtn=true" @mouseleave="hoverBtn=false"
                  :style="hoverBtn ? 'transform: scale(1.1); box-shadow:0 8px 18px rgba(0,0,0,0.25);' : ''"
                >
                  ↓
                </n-button>
              </Transition>
            
              <!-- 返回顶部 -->
              
              <a href="https://github.com/Kiliwwwww/download_bot" target="_blank">
                <img src="/public/img/logo.svg" style="width:50px; height:50px; border-radius:25px; background: linear-gradient(135deg, #ff7eb9, #ff758c); color:#fff; font-size:22px; font-weight:700; box-shadow:0 6px 14px rgba(0,0,0,0.2); transition: transform 0.2s;" />
              </a>
            </div>
        `,
        setup() {
            const isTop = ref(true)
            const isBottom = ref(false)
            const hoverBtn = ref(false)
            const hoverTopBtn = ref(false)
            const goBottom = () => window.scrollTo({top: document.body.scrollHeight, behavior: 'smooth'})
            const goTop = () => window.scrollTo({top: 0, behavior: 'smooth'})
            const handleScroll = () => {
                const scrollTop = window.scrollY
                const windowHeight = window.innerHeight
                const bodyHeight = document.body.scrollHeight
                isTop.value = scrollTop < 50
                isBottom.value = scrollTop + windowHeight >= bodyHeight - 50
            }
            onMounted(() => {
                window.addEventListener('scroll', handleScroll)
                handleScroll() // 初始化状态
            })

            onBeforeUnmount(() => {
                window.removeEventListener('scroll', handleScroll)
            })
            return {
                isTop, isBottom, hoverBtn, hoverTopBtn,
                goBottom, goTop, handleScroll
            }
        },
        components: {NButton}
    }
}
