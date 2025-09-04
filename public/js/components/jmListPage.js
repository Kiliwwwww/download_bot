// jm_list_page.js
import {themeOverrides} from '../utils/theme.js'
import {fetchJmList} from '../api/jmService.js'
import {createJmDetailModal} from '/public/js/model/JmDetailModal.js'
import {createJmBottomBarComponent} from '/public/js/model/JmBottomBarComponent.js'
import {downloadById} from '../api/downloadService.js'

export function createJmListPage(Vue, naive) {
  const { ref, onMounted, computed, watch } = Vue
  const {
    NCard, NConfigProvider, NButton, NPagination, NSpin, NSwitch,
    NTabs, NTabPane, NCheckbox, NCheckboxGroup
  } = naive

  const privacyMode = ref(localStorage.getItem('privacyMode') === 'true')
  watch(privacyMode, val => localStorage.setItem('privacyMode', val))

  const JmDetailModal = createJmDetailModal(naive, privacyMode)
  const JmBottomBarComponent = createJmBottomBarComponent(naive, privacyMode)

  return {
    template: `
      <n-config-provider :theme-overrides="themeOverrides">
        <div style="
          display:flex; 
          flex-direction:column; 
          align-items:center; 
          padding:60px 20px;
        "
        >
          <n-card :style="cardStyle">
            
            <!-- tabs -->
            <n-tabs v-model:value="type" justify-content="space-evenly" type="line"
              :tab-style="{ fontWeight: '600', fontSize:'16px' , color:'#ff7eb9'}"
              pane-style="padding:20px 0">
              <n-tab-pane v-for="item in pageTitleArr" :key="item.key" :name="item.key" :tab="item.value"/>
            </n-tabs>

            <!-- 返回主页 -->
            <a href="/" style="position:absolute; top:20px; left:20px; color:#ff7eb9; font-weight:600; text-decoration:none;">
              返回主页
            </a>

            <!-- 隐私模式 -->
            <div style="position:absolute; top:20px; right:20px; display:flex; align-items:center; gap:8px;">
              <span style="font-size:14px; color:#ff7eb9; font-weight:600;">隐私模式</span>
              <n-switch v-model:value="privacyMode" size="small"/>
            </div>

            <!-- 列表内容 -->
            <div style="min-height:200px; position:relative;">
              <n-spin :show="loading" size="large">
                <div v-if="items.length" style="display:flex; flex-direction:column; gap:16px;">

                  <!-- 全选 & 批量下载 -->
                  <div style="margin:10px 0; display:flex; justify-content: space-between; align-items:center;">
                    <n-checkbox :checked="isAllSelected" :indeterminate="isIndeterminate" @update:checked="toggleSelectAll">
                      全选
                    </n-checkbox>
                    <n-button type="primary" size="small" round
                              :disabled="selectedItems.length === 0" 
                              @click="handleBatchDownload">
                      批量下载 ({{ selectedItems.length }})
                    </n-button>
                  </div>

                  <!-- 列表项 -->
                  <n-checkbox-group v-model:value="selectedItems">
                    <div v-for="item in items" :key="item.jm_id"
                         style="
                           padding:16px 20px; 
                           border-radius:14px; 
                           background:#fff; 
                           display:flex; 
                           align-items:center; 
                           gap:14px;
                           border:1px solid #f0f0f0;
                           transition: all 0.25s ease;
                           cursor:pointer;
                           margin-bottom: 10px;
                         "
                         @mouseover="(e)=>{e.currentTarget.style.transform='scale(1.02)';e.currentTarget.style.boxShadow='0 6px 16px rgba(0,0,0,0.1)'}"
                         @mouseleave="(e)=>{e.currentTarget.style.transform='scale(1)';e.currentTarget.style.boxShadow='none'}">
                      <n-checkbox :value="item.jm_id"/>
                      <div style="flex:1;" @click="JmDetailModal.setup().showDetail(item.jm_id)">
                        <h3 style="margin:0; font-size:16px; font-weight:600; color:#ff7eb9;">#{{ item.jm_id }}</h3>
                        <p style="margin:6px 0 0; font-size:14px; color:#555;">{{ item.title }}</p>
                      </div>
                    </div>
                  </n-checkbox-group>
                </div>

                <div v-else-if="!loading" style="text-align:center; padding:60px 0; color:#999; font-size:14px;">
                  暂无数据
                </div>
              </n-spin>
            </div>

            <!-- 分页 -->
            <div style="margin-top:30px; display:flex; justify-content:center;">
              <n-pagination v-model:page="page" :page-count="totalPages" @update:page="fetchList"/>
            </div>
          </n-card>

          <component :is="JmDetailModal"/>
          <component :is="JmBottomBarComponent"/>
        </div>
      </n-config-provider>
    `,
    setup() {
      const items = ref([])
      const page = ref(1)
      const perPage = ref(80)
      const total = ref(0)
      const loading = ref(false)
      const selectedItems = ref([])

      // 全选状态
      const isAllSelected = computed(() =>
        items.value.length > 0 && selectedItems.value.length === items.value.length
      )
      const isIndeterminate = computed(() =>
        selectedItems.value.length > 0 && selectedItems.value.length < items.value.length
      )
      const toggleSelectAll = (checked) => {
        if (checked) {
          selectedItems.value = items.value.map(i => i.jm_id)
        } else {
          selectedItems.value = []
        }
      }

      const type = ref(new URLSearchParams(window.location.search).get('type') || 'last')
      const pageTitleArr = ref([
        {key: "last", value: "最新漫画"},
        {key: "view", value: "游览最高"},
        {key: "like", value: "点赞最多"},
        {key: "picture", value: "最多图片"}
      ])
      const totalPages = computed(() => Math.ceil(total.value / perPage.value))

      const fetchList = async () => {
        loading.value = true
        try {
          const res = await fetchJmList(type.value, page.value)
          if (res.code === 200) {
            items.value = res.data.items
            total.value = res.data.total
            perPage.value = res.data.per_page
            selectedItems.value = [] // 换页清空
          }
        } finally {
          loading.value = false
        }
      }

      watch(type, () => {
        page.value = 1
        fetchList()
        const url = new URL(window.location)
        url.searchParams.set('type', type.value)
        window.history.replaceState({}, '', url)
      })

      const handleBatchDownload = async () => {
        if (!selectedItems.value.length) return
        loading.value = true
        try {
          console.log('批量下载选中：', selectedItems.value)
          await downloadById(selectedItems.value)
        } finally {
          loading.value = false
        }
      }

      const cardStyle = computed(() => ({
        width: '100%',
        maxWidth: '900px',
        minHeight: '500px',
        padding: '30px 40px',
        borderRadius: '20px',
        backgroundColor: '#fff',
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
        position: 'relative'
      }))

      onMounted(fetchList)

      return {
        items, page, perPage, total, totalPages, loading,
        type, pageTitleArr, fetchList,
        privacyMode, themeOverrides,
        JmDetailModal, JmBottomBarComponent,
        selectedItems, isAllSelected, isIndeterminate, toggleSelectAll,
        handleBatchDownload, cardStyle
      }
    },
    components: {
      NCard, NConfigProvider, NButton, NPagination, NSpin, NSwitch,
      NTabs, NTabPane, NCheckbox, NCheckboxGroup
    }
  }
}
