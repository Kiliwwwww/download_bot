import {themeOverrides} from '../utils/theme.js'
import {fetchJmList, fetchJmDetail} from '../api/jmService.js'
import {downloadById} from '../api/downloadService.js'

export function createJmListPage(Vue, naive) {
    const {ref, onMounted, computed, onBeforeUnmount, watch} = Vue
    const {
        NCard, NConfigProvider, NButton, NPagination, NSpin,
        useMessage, useLoadingBar, NModal, NSwitch
    } = naive

    return {
        template: `
      <n-config-provider :theme-overrides="themeOverrides">
        <div style="display:flex; flex-direction:column; align-items:center; margin-top: 60px; gap: 20px; margin-bottom: 60px;">
          <n-card :style="cardStyle">
            
            <!-- 返回主页 -->
            <a 
              href="/" 
              style="position:absolute; top:20px; left:20px; color:#ff7eb9; font-weight:600; text-decoration:none; transition:all 0.2s;"
              @mouseover="hoverBack=true"
              @mouseleave="hoverBack=false"
              :style="hoverBack ? 'color:#ff4d94; transform:scale(1.05);' : ''">
              返回主页
            </a>

            <!-- 隐私模式开关 -->
            <div style="position:absolute; top:20px; right:20px; display:flex; align-items:center; gap:8px;">
              <span style="font-size:14px; color:#ff7eb9; font-weight:600;">隐私模式</span>
              <n-switch v-model:value="privacyMode" size="small"/>
            </div>

            <!-- 标题 -->
            <h2 style="
              font-weight:800; font-size:26px;
              background:linear-gradient(90deg, #ff7eb9, #ff758c);
              -webkit-background-clip:text;
              -webkit-text-fill-color:transparent;
              text-align:center; margin-bottom:50px;">
              {{ pageTitle }}
            </h2>

            <!-- 列表区域 -->
            <div style="min-height:100px; position:relative;">
              <n-spin :show="loading" size="large">
                <div v-if="items.length" style="display:flex; flex-direction:column; gap:14px;">
                  <div 
                    v-for="item in items" 
                    :key="item.jm_id"
                    style="padding:14px 18px; border-radius:12px; background:#fff0f6; box-shadow:0 4px 10px rgba(0,0,0,0.08); cursor:pointer; transition:all 0.25s ease;"
                    @mouseover="hoverItem = item.jm_id"
                    @mouseleave="hoverItem = ''"
                    @click="showDetail(item.jm_id)"
                    :style="hoverItem === item.jm_id ? {
                      transform: 'scale(1.02)',
                      boxShadow: '0 8px 18px rgba(0,0,0,0.12)'
                    } : {}"
                  >
                    <h3 style="margin:0; font-size:16px; font-weight:600; color:#ff7eb9;">#{{ item.jm_id }}</h3>
                    <p style="margin:4px 0 0; font-size:14px; color:#333;">{{ item.title }}</p>
                  </div>
                </div>
                <div v-else-if="!loading" style="text-align:center; padding:40px 0; color:#999;">暂无数据</div>
              </n-spin>
            </div>

            <!-- 分页 -->
            <div style="margin-top:20px; display:flex; justify-content:center;">
              <n-pagination
                v-model:page="page"
                :page-count="totalPages"
                @update:page="fetchList"
              />
            </div>
          </n-card>

          <!-- 返回按钮 -->
          <n-button 
            style="margin-top:10px; padding:10px 20px; font-size:15px; border-radius:10px; background:linear-gradient(90deg, #ff7eb9, #ff758c); color:#fff; font-weight:600; box-shadow:0 6px 12px rgba(0,0,0,0.15);"
            @click="goBack">
            ← 返回
          </n-button>

          <!-- 浮动按钮 -->
          <div style="position:fixed; bottom:40px; right:40px; display:flex; flex-direction:column; gap:12px; z-index:999;">
            <Transition name="fade">
              <n-button
                v-if="!isTop"
                @click="goTop"
                title="返回顶部"
                style="width:50px; height:50px; border-radius:25px; background:linear-gradient(135deg, #7ebfff, #758cff); color:#fff; font-size:22px; font-weight:700; box-shadow:0 6px 14px rgba(0,0,0,0.2); transition:transform 0.2s;"
                @mouseover="hoverTopBtn=true" @mouseleave="hoverTopBtn=false"
                :style="hoverTopBtn ? 'transform:scale(1.1); box-shadow:0 8px 18px rgba(0,0,0,0.25);' : ''">
                ↑
              </n-button>
            </Transition>
            <Transition name="fade">
              <n-button
                v-if="!isBottom"
                @click="goBottom"
                title="跳到底部"
                style="width:50px; height:50px; border-radius:25px; background:linear-gradient(135deg, #ff7eb9, #ff758c); color:#fff; font-size:22px; font-weight:700; box-shadow:0 6px 14px rgba(0,0,0,0.2); transition:transform 0.2s;"
                @mouseover="hoverBtn=true" @mouseleave="hoverBtn=false"
                :style="hoverBtn ? 'transform:scale(1.1); box-shadow:0 8px 18px rgba(0,0,0,0.25);' : ''">
                ↓
              </n-button>
            </Transition>
            <a href="https://github.com/Kiliwwwww/download_bot" target="_blank">
              <img src="/public/img/logo.svg" style="width:50px; height:50px; border-radius:25px; background:linear-gradient(135deg, #ff7eb9, #ff758c); box-shadow:0 6px 14px rgba(0,0,0,0.2);" />
            </a>
          </div>

          <!-- 详情弹窗 -->
            <n-modal v-model:show="detailVisible" style="width: 920px; max-width:95vw;">
              <n-card :style="cardStyle" title="详情" closable @close="detailVisible=false">
                <n-spin :show="detailLoading">
                  <div v-if="detail" style="display:flex; gap:24px; align-items:flex-start; flex-wrap:wrap;">
                    
                    <!-- 左侧图片 -->
                    <div style="flex:0 0 260px; text-align:center;">
                      <img 
                        :src="privacyMode ? '/public/img/logo.webp' : detail.img_url" 
                        alt="封面" 
                        style="width:100%; max-width:260px; border-radius:14px; box-shadow:0 6px 20px rgba(0,0,0,0.15);" 
                      />
                    </div>
                    
                    <!-- 右侧信息 -->
                    <div style="flex:1; display:flex; flex-direction:column; gap:12px;">
                      <h3 style="font-size:22px; font-weight:700; color:#ff7eb9; margin:0;">
                        #{{ detail.jm_id }} - {{ detail.name }}
                      </h3>
                      
                      <!-- 基本信息 -->
                      <div style="display:flex; flex-wrap:wrap; gap:12px; font-size:14px; color:#666;">
                        <span>作者: {{ detail.authors.join(', ') || '未知' }}</span>
                        <span>上传时间: {{ detail.pub_date }}</span>
                        <span>更新时间: {{ detail.update_date }}</span>
                        <span>页数: {{ detail.page_count }}</span>
                        <span>点赞: {{ detail.likes }} | 浏览: {{ detail.views }} | 评论: {{ detail.comment_count }}</span>
                      </div>
            
                      <!-- 标签 -->
                      <div style="display:flex; flex-wrap:wrap; gap:8px; margin-top:6px;">
                        <span 
                          v-for="tag in detail.tags" 
                          :key="tag"
                          style="background: linear-gradient(90deg,#ff7eb9,#ff758c); color:#fff; padding:2px 10px; border-radius:12px; font-size:12px;"
                        >
                          {{ tag }}
                        </span>
                        <span v-if="!detail.tags.length" style="color:#999;">无标签</span>
                      </div>
            
                      <!-- 简介 -->
                      <div v-if="detail.description" 
                           style="margin-top:10px; max-height:180px; overflow-y:auto; padding:12px; border-radius:10px; background:#fff0f6; box-shadow:inset 0 2px 6px rgba(0,0,0,0.05); font-size:14px; line-height:1.6; color:#444;">
                        {{ detail.description }}
                      </div>
            
                      <!-- 操作按钮 -->
                      <div style="margin-top:18px; display:flex; gap:14px;">
                        <n-button 
                          style="flex:1; padding:10px 16px; font-size:15px; border-radius:12px; background:linear-gradient(90deg, #ff7eb9, #ff758c); color:#fff; font-weight:600; box-shadow:0 4px 12px rgba(0,0,0,0.15); transition: transform 0.2s;" 
                          @mouseover.native="hoverBtn = true" @mouseleave.native="hoverBtn=false"
                          :style="hoverBtn ? 'transform:scale(1.05);' : ''"
                          @click="handleDownload(detail.jm_id)">
                          ⬇ 下载
                        </n-button>
                        <n-button 
                          style="flex:1; padding:10px 16px; font-size:15px; border-radius:12px; background:linear-gradient(90deg, #7ebfff, #758cff); color:#fff; font-weight:600; box-shadow:0 4px 12px rgba(0,0,0,0.15); transition: transform 0.2s;" 
                          @mouseover.native="hoverBtnView = true" @mouseleave.native="hoverBtnView=false"
                          :style="hoverBtnView ? 'transform:scale(1.05);' : ''"
                          @click="handleView(detail.jm_id)">
                          🔍 查看详情
                        </n-button>
                      </div>
                    </div>
                  </div>
                  <div v-else style="color:#999; text-align:center; padding:40px 0;">暂无详情</div>
                </n-spin>
              </n-card>
            </n-modal>


        </div>
      </n-config-provider>
    `,
        setup() {
            const message = useMessage()
            const items = ref([])
            const page = ref(1)
            const perPage = ref(80)
            const total = ref(0)
            const hoverItem = ref('')
            const loading = ref(false)
            const type = new URLSearchParams(window.location.search).get('type') || 'last'

            const isTop = ref(true)
            const isBottom = ref(false)
            const hoverBtn = ref(false)
            const hoverTopBtn = ref(false)
            const hoverBack = ref(false)

            const detailVisible = ref(false)
            const detail = ref(null)
            const detailLoading = ref(false)

            // 隐私模式
            const privacyMode = ref(localStorage.getItem('privacyMode') === 'true')  // 默认读取

            watch(privacyMode, (val) => {
              localStorage.setItem('privacyMode', val)  // 每次修改存储
            })
            const typeMap = {
                last: '最新漫画',
                view: '游览最高',
                like: '点赞最多',
                picture: '最多图片'
            }

            const pageTitle = computed(() => typeMap[type] || 'JM 列表')
            const totalPages = computed(() => Math.ceil(total.value / perPage.value))
            const loadingBar = useLoadingBar()

            const handleDownload = (jmId) => {
                message.info(`下载任务进入队列: #${jmId}`)
                loadingBar.start()
                downloadById([jmId]).then(res => {
                    if (res.code === 200) {
                        loadingBar.finish()
                    } else {
                        loadingBar.error()
                        message.error(res.message || '下载失败')
                    }
                })
            }

            const handleView = (jmId) => {
              window.open(`https://18comic.vip/album/${jmId}`, '_blank') // 假设你有详情页
            }
            const fetchList = async () => {
                loading.value = true
                try {
                    loadingBar.start()
                    const res = await fetchJmList(type, page.value)
                    if (res.code === 200) {
                        loadingBar.finish()
                        items.value = res.data.items
                        total.value = res.data.total
                        perPage.value = res.data.per_page
                    } else {
                        loadingBar.error()
                        message.error(res.message || '加载失败')
                    }
                } finally {
                    loading.value = false
                }
            }

            const showDetail = async (jmId) => {
                detail.value = null
                detailVisible.value = true
                detailLoading.value = true
                try {
                    const res = await fetchJmDetail(jmId)
                    if (res.code === 200) {
                        detail.value = res.data
                    } else {
                        message.error(res.message || '加载详情失败')
                    }
                } finally {
                    detailLoading.value = false
                }
            }

            const goBack = () => window.history.back()
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
                fetchList()
                window.addEventListener('scroll', handleScroll)
                handleScroll()
            })

            onBeforeUnmount(() => {
                window.removeEventListener('scroll', handleScroll)
            })

            const cardStyle = computed(() => ({
                width: '1000px',
                minHeight: '400px',
                padding: '20px',
                borderRadius: '16px',
                backgroundColor: '#fff',
                boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
                transition: 'all 0.3s ease'
            }))

            return {
                items, page, perPage, total, hoverItem,
                fetchList, goBack, pageTitle, totalPages,
                cardStyle, themeOverrides, loading,
                goBottom, goTop, isTop, isBottom,
                hoverBtn, hoverTopBtn, hoverBack,
                detailVisible, detail, detailLoading,
                showDetail,handleDownload, handleView,
                privacyMode
            }
        },
        components: {NCard, NConfigProvider, NButton, NPagination, NSpin, NModal, NSwitch}
    }
}
