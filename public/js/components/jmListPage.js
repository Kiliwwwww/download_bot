import {themeOverrides} from '../utils/theme.js'
import {fetchJmList} from '../api/jmService.js'

export function createJmListPage(Vue, naive) {
    const {ref, onMounted, computed} = Vue
    const {NCard, NConfigProvider, NButton, NPagination, NSpin, useMessage, useLoadingBar} = naive

    return {
        template: `
      <n-config-provider :theme-overrides="themeOverrides">
        <div style="display:flex; flex-direction:column; align-items:center; margin-top: 60px; gap: 20px;">
          <n-card :style="cardStyle">
            <h2 style="
              font-weight: 800;
              font-size: 26px;
              background: linear-gradient(90deg, #ff7eb9, #ff758c);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              text-align: center;
              margin-bottom: 50px;
            ">
              {{ pageTitle }}
            </h2>

            <!-- 列表+加载区域 -->
            <div style="min-height: 100px; position: relative;">
              <n-spin :show="loading" size="large">
                <div v-if="items.length" style="display:flex; flex-direction:column; gap: 14px;">
                  <div 
                    v-for="item in items" 
                    :key="item.jm_id"
                    style="padding:14px 18px; border-radius:12px; background:#fff0f6; box-shadow:0 4px 10px rgba(0,0,0,0.08); cursor:pointer; transition: all 0.25s ease;"
                    @mouseover="hoverItem = item.jm_id"
                    @mouseleave="hoverItem = ''"
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

          <n-button 
            style="margin-top:10px; padding: 10px 20px; font-size:15px; border-radius:10px; background: linear-gradient(90deg, #ff7eb9, #ff758c); color:#fff; font-weight:600; box-shadow:0 6px 12px rgba(0,0,0,0.15);"
            @click="goBack"
          >
            ← 返回
          </n-button>
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

            const typeMap = {
                last: '最新本子',
                view: '游览最高',
                like: '点赞最多',
                picture: '最多图片'
            }

            const pageTitle = computed(() => typeMap[type] || 'JM 列表')

            const totalPages = computed(() => Math.ceil(total.value / perPage.value))
            const loadingBar = useLoadingBar()

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

            const goBack = () => {
                window.history.back()
            }

            onMounted(() => {
                fetchList()
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
                items,
                page,
                perPage,
                total,
                hoverItem,
                fetchList,
                goBack,
                pageTitle,
                totalPages,
                cardStyle,
                themeOverrides,
                loading
            }
        },
        components: {NCard, NConfigProvider, NButton, NPagination, NSpin}
    }
}
