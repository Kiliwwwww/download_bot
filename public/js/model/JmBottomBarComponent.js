// JmDetailModal.js

export function createJmBottomBarComponent(naive, privacyModeRef) {
    const {ref, onMounted, onBeforeUnmount, watch} = Vue
    const { NButton } = naive
    watch(privacyModeRef, val => localStorage.setItem('privacyMode', val))
    return {
        template: `
        <div style="position: fixed; bottom: 40px; right: 40px; display: flex; flex-direction: column; gap: 12px; z-index: 999;">
          <!-- 返回顶部 -->
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
            <n-tooltip trigger="hover">
                <template #trigger>
                    <n-button
                    text
                    @click="togglePrivacy()"
                    title="开启隐私功能"
                    style="
                      width:50px;
                      height:50px;
                      border-radius:25px;
                      background: linear-gradient(135deg, #ff7eb9, #ff758c);
                      box-shadow:0 6px 14px rgba(0,0,0,0.2);
                      transition: transform 0.2s;
                      padding:0;
                      display:flex;
                      align-items:center;
                      justify-content:center;
                    "
                    :style="hoverPrivacyBtn ? 'transform: scale(1.1); box-shadow:0 8px 18px rgba(0,0,0,0.25);' : ''"
                  >
                    <div style="display:flex; align-items:center; justify-content:center; width:100%; height:100%;">
                      <img
                        :src=" get_privacy() ? '/public/img/lock.svg?v=${privacyModeRef.value}' : '/public/img/unlock.svg?v=${privacyModeRef.value}'"
                        style="width:40%; height:40%; object-fit:contain; display:block;"
                      />
                    </div>
                  </n-button>
                </template>
                {{get_privacy()? '关闭隐私模式':'开启隐私模式' }}
            </n-tooltip>
              


        

        
          <!-- 下载 bot酱 -->
          <a href="https://github.com/Kiliwwwww/download_bot" target="_blank" title="下载 bot酱">
            <img src="/public/img/logo.svg" style="width:50px; height:50px; border-radius:25px; background: linear-gradient(135deg, #ff7eb9, #ff758c); color:#fff; font-size:22px; font-weight:700; box-shadow:0 6px 14px rgba(0,0,0,0.2); transition: transform 0.2s;" />
          </a>
        </div>

        `,
        setup() {
            const isTop = ref(true)
            const isBottom = ref(false)
            const hoverBtn = ref(false)
            const hoverTopBtn = ref(false)
            const localPrivacy = ref(false)
            localPrivacy.value = privacyModeRef.value
            const goBottom = () => window.scrollTo({top: document.body.scrollHeight, behavior: 'smooth'})
            const goTop = () => window.scrollTo({top: 0, behavior: 'smooth'})
            const handleScroll = () => {
                const scrollTop = window.scrollY
                const windowHeight = window.innerHeight
                const bodyHeight = document.body.scrollHeight
                isTop.value = scrollTop < 50
                isBottom.value = scrollTop + windowHeight >= bodyHeight - 50
            }
            const get_privacy = ()=>{
                return privacyModeRef.value
            }
            const togglePrivacy = ()=>{
                privacyModeRef.value = !privacyModeRef.value
                localPrivacy.value = privacyModeRef.value
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
                goBottom, goTop, handleScroll, togglePrivacy,get_privacy
            }
        },
        components: {NButton}
    }
}
