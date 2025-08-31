import {themeOverrides} from '../utils/theme.js'
import {fetchJmList} from '../api/jmService.js'
import {createJmDetailModal} from '/public/js/model/JmDetailModal.js'

export function createJmListPage(Vue, naive) {
    const {ref, onMounted, computed, onBeforeUnmount, watch} = Vue
    const {NCard, NConfigProvider, NButton, NPagination, NSpin, NSwitch} = naive

    const privacyMode = ref(localStorage.getItem('privacyMode') === 'true')
    watch(privacyMode, val => localStorage.setItem('privacyMode', val))

    const JmDetailModal = createJmDetailModal(naive, privacyMode)

    return {
        template: `
        <n-config-provider :theme-overrides="themeOverrides">
          <div style="display:flex; flex-direction:column; align-items:center; margin-top: 60px; gap:20px; margin-bottom:60px;">
            <n-card :style="cardStyle">
              <!-- 返回主页 -->
              <a href="/" style="position:absolute; top:20px; left:20px; color:#ff7eb9; font-weight:600; text-decoration:none;">返回主页</a>

              <!-- 隐私模式开关 -->
              <div style="position:absolute; top:20px; right:20px; display:flex; align-items:center; gap:8px;">
                <span style="font-size:14px; color:#ff7eb9; font-weight:600;">隐私模式</span>
                <n-switch v-model:value="privacyMode" size="small"/>
              </div>

              <h2 style="font-weight:800; font-size:26px; background:linear-gradient(90deg, #ff7eb9, #ff758c); -webkit-background-clip:text; -webkit-text-fill-color:transparent; text-align:center; margin-bottom:50px;">
                {{ pageTitle }}
              </h2>

              <div style="min-height:100px; position:relative;">
                <n-spin :show="loading" size="large">
                  <div v-if="items.length" style="display:flex; flex-direction:column; gap:14px;">
                    <div v-for="item in items" :key="item.jm_id" 
                         style="padding:14px 18px; border-radius:12px; background:#fff0f6; cursor:pointer;"
                         @click="JmDetailModal.setup().showDetail(item.jm_id)">
                      <h3 style="margin:0; font-size:16px; font-weight:600; color:#ff7eb9;">#{{ item.jm_id }}</h3>
                      <p style="margin:4px 0 0; font-size:14px; color:#333;">{{ item.title }}</p>
                    </div>
                  </div>
                  <div v-else-if="!loading" style="text-align:center; padding:40px 0; color:#999;">暂无数据</div>
                </n-spin>
              </div>

              <div style="margin-top:20px; display:flex; justify-content:center;">
                <n-pagination v-model:page="page" :page-count="totalPages" @update:page="fetchList"/>
              </div>
            </n-card>

            <n-button style="margin-top:10px;" @click="goBack">← 返回</n-button>

            <!-- 插入弹窗组件 -->
            <component :is="JmDetailModal"/>
          </div>
        </n-config-provider>
        `,
        setup() {
            const items = ref([])
            const page = ref(1)
            const perPage = ref(80)
            const total = ref(0)
            const loading = ref(false)
            const type = new URLSearchParams(window.location.search).get('type') || 'last'
            const pageTitle = computed(() => ({
                last:'最新漫画', view:'游览最高', like:'点赞最多', picture:'最多图片'
            }[type] || 'JM 列表'))
            const totalPages = computed(() => Math.ceil(total.value / perPage.value))

            const fetchList = async () => {
                loading.value = true
                try {
                    const res = await fetchJmList(type, page.value)
                    if (res.code === 200) {
                        items.value = res.data.items
                        total.value = res.data.total
                        perPage.value = res.data.per_page
                    }
                } finally {
                    loading.value = false
                }
            }

            const goBack = () => window.history.back()

            const cardStyle = computed(() => ({
                width: '1000px', minHeight:'400px', padding:'20px',
                borderRadius:'16px', backgroundColor:'#fff', boxShadow:'0 8px 20px rgba(0,0,0,0.15)'
            }))

            onMounted(fetchList)

            return {items, page, pageTitle, totalPages, fetchList, goBack, cardStyle, loading, JmDetailModal, privacyMode, themeOverrides}
        },
        components: {NCard, NConfigProvider, NButton, NPagination, NSpin, NSwitch}
    }
}
