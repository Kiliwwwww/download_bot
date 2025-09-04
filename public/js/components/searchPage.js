// search_page.js
import {searchJmComic} from '../api/searchService.js'
import {createJmDetailModal} from '/public/js/model/JmDetailModal.js'
import {createJmBottomBarComponent} from '/public/js/model/JmBottomBarComponent.js'
import {downloadById} from '../api/downloadService.js'

export function createSearchPage(Vue, naive) {
    const {ref, onMounted, computed, watch} = Vue
    const {NInput, NButton, NCard, useMessage, useLoadingBar, NPagination, NCheckbox, NCheckboxGroup} = naive
    const privacyMode = ref(localStorage.getItem('privacyMode') === 'true')
    watch(privacyMode, val => localStorage.setItem('privacyMode', val))

    const JmDetailModal = createJmDetailModal(naive, privacyMode)
    const JmBottomBarComponent = createJmBottomBarComponent(naive, privacyMode)

    return {
        template: `
        <div class="search-page">

            <!-- Logo -->
            <img src="/public/img/searchlogo.png" alt="logo" class="logo"/>

            <!-- 搜索类型选项 -->
            <div class="search-types" style="display:flex; justify-content:center; gap:20px; margin:15px 0;">
                <n-button size="small" tertiary @click="setSearchType('keyword')">模糊查询</n-button>
                <n-button size="small" tertiary @click="setSearchType('tag')">搜标签</n-button>
                <n-button size="small" tertiary @click="setSearchType('author')">搜作者</n-button>
                <n-button size="small" tertiary @click="setSearchType('actor')">搜主角</n-button>
            </div>

            <!-- 搜索框 -->
            <div class="search-wrapper">
                <n-input
                    ref="searchInput"
                    v-model:value="queryInput"
                    :placeholder="placeholder"
                    class="search-input"
                    @keyup.enter="handleSearch"
                >
                    <template #prefix>
                        <span v-if="prefixText" style="color:#ff7eb9;">{{ prefixText }}</span>
                    </template>
                </n-input>
                <div class="search-buttons">
                    <a href="#" @click="handleSearch" style="color:#ff7eb9">
                        JMComic搜索
                    </a>
                </div>
            </div>

            <!-- 搜索结果 -->
            <div v-if="results.length" class="results">

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

                <!-- 结果列表（已修正样式） -->
                <n-checkbox-group v-model:value="selectedItems">
                  <n-card 
                      v-for="item in results" 
                      :key="item.jm_id"
                      @mouseenter="hoverItem = item.jm_id"
                      @mouseleave="hoverItem = ''"
                      :style="{
                        gap: '14px',
                        padding: '0px 16px',
                        borderRadius: '12px',
                        background: hoverItem === item.jm_id ? '#ffe6f0' : '#fff',
                        cursor: 'default',
                        border: '1px solid #f0f0f0',
                        transition: 'transform .12s ease, box-shadow .12s ease',
                        marginBottom: '10px'
                      }"
                    >
                      <!-- 文字内容 -->
                      <div style="flex: 1; min-width:0; cursor:pointer;" @click="JmDetailModal.setup().showDetail(item.jm_id)">
                          <div style="font-weight:600; color:#ff7eb9; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                            <n-checkbox :value="item.jm_id" style="margin-right: 10px" @click.stop /> #{{ item.jm_id }} {{ item.title }}
                          </div>
                      </div>
                    </n-card>

                </n-checkbox-group>

                <!-- 分页 -->
                <div style="margin-top:20px; display:flex; justify-content:center;">
                    <n-pagination v-model:page="page" :page-count="totalPages" @update:page="handleSearch"/>
                </div>
            </div>

            <!-- 插入弹窗组件 -->
            <component :is="JmDetailModal"/>
            <component :is="JmBottomBarComponent"/>

        </div>
        `,
        setup() {
            const queryInput = ref('')
            const prefixText = ref('')
            const searchType = ref('')
            const results = ref([])
            const hoverItem = ref('')
            const message = useMessage()
            const loadingBar = useLoadingBar()
            const searchInput = ref(null)
            const page = ref(1)
            const total = ref(0)
            const perPage = ref(80)
            const totalPages = computed(() => Math.ceil(total.value / perPage.value))

            // 选择框逻辑
            const selectedItems = ref([])
            const isAllSelected = computed(() =>
                results.value.length > 0 && selectedItems.value.length === results.value.length
            )
            const isIndeterminate = computed(() =>
                selectedItems.value.length > 0 && selectedItems.value.length < results.value.length
            )
            const toggleSelectAll = (checked) => {
                if (checked) {
                    selectedItems.value = results.value.map(i => i.jm_id)
                } else {
                    selectedItems.value = []
                }
            }

            const placeholder = computed(() => {
                if (searchType.value === 'tag') return '请输入标签'
                if (searchType.value === 'author') return '请输入作者'
                if (searchType.value === 'actor') return '请输入主角'
                return '请输入漫画名称'
            })

            const setSearchType = (type) => {
                searchType.value = type
                queryInput.value = '' // 重置用户输入
                if (type === 'tag') prefixText.value = '搜标签：'
                if (type === 'author') prefixText.value = '搜作者：'
                if (type === 'actor') prefixText.value = '搜主角：'
                if (type === 'keyword') prefixText.value = ''
            }

            const handleSearch = async () => {
                const val = queryInput.value.trim()
                if (!val && !searchType.value) {
                    message.warning('请输入搜索内容')
                    return
                }

                loadingBar.start()
                try {
                    const res = await searchJmComic({
                        query: val,
                        page: page.value,
                        type: searchType.value || 'keyword'
                    })
                    if (res.code === 200) {
                        results.value = res.data.items || []
                        total.value = res.data.total
                        selectedItems.value = [] // 每次搜索清空已选
                        loadingBar.finish()
                    } else {
                        message.error(res.message || '搜索失败')
                        loadingBar.error()
                    }
                } catch (err) {
                    message.error('搜索接口请求失败')
                    loadingBar.error()
                }
            }

            const handleBatchDownload = async () => {
                if (!selectedItems.value.length) return
                try {
                    loadingBar.start()
                    message.info('批量下载开始')
                    await downloadById(selectedItems.value)
                    loadingBar.finish()
                } catch (e) {
                    message.error('下载失败')
                    loadingBar.error()
                }
            }

            onMounted(() => {
                if (searchInput.value) {
                    searchInput.value.focus()
                }
                // 解析 URL 参数
                const params = new URLSearchParams(window.location.search)
                const query = params.get('query')
                const type = params.get('type')

                if (query && type) {
                    // 设置搜索类型（会自动设置 prefixText 和 placeholder）
                    setSearchType(type)

                    // 设置搜索内容
                    queryInput.value = query

                    // 调用搜索
                    handleSearch()
                }
            })

            return {
                queryInput, prefixText, searchType, setSearchType,
                results, hoverItem, handleSearch, searchInput,
                page, perPage, total, totalPages, placeholder,
                JmDetailModal, JmBottomBarComponent,
                selectedItems, isAllSelected, isIndeterminate, toggleSelectAll, handleBatchDownload
            }
        },
        components: {NInput, NButton, NCard, NPagination, NCheckbox, NCheckboxGroup}
    }
}
