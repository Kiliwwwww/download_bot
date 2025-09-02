import { searchJmComic } from '../api/searchService.js'
import { createJmDetailModal } from '/public/js/model/JmDetailModal.js'
import { createJmBottomBarComponent } from '/public/js/model/JmBottomBarComponent.js'

export function createSearchPage(Vue, naive) {
    const { ref, onMounted, computed, watch } = Vue
    const { NInput, NButton, NCard, useMessage, useLoadingBar, NPagination } = naive
    const privacyMode = ref(localStorage.getItem('privacyMode') === 'true')
    watch(privacyMode, val => localStorage.setItem('privacyMode', val))

    const JmDetailModal = createJmDetailModal(naive, privacyMode)
    const JmBottomBarComponent = createJmBottomBarComponent(naive, privacyMode)

    return {
        template: `
        <div class="search-page">

            <!-- Logo -->
            <img src="/public/img/logo.webp" alt="logo" class="logo" />

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
                <n-card 
                    v-for="item in results" 
                    :key="item.jm_id" 
                    class="result-item"
                    @click="JmDetailModal.setup().showDetail(item.jm_id)"
                    @mouseenter="hoverItem = item.jm_id"
                    @mouseleave="hoverItem = ''"
                    :style="{ background: hoverItem === item.jm_id ? '#ffe6f0' : '#fff' }"
                >
                    <div>{{ item.title }}</div>
                </n-card>
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
                        type: searchType.value || 'default'
                    })
                    if (res.code === 200) {
                        results.value = res.data.items || []
                        total.value = res.data.total
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

            const goToDownload = (jm_id) => {
                window.location.href = `/admins/pages/jm_detail_page.html?id=${jm_id}`
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
                JmDetailModal, JmBottomBarComponent
            }
        },
        components: { NInput, NButton, NCard, NPagination }
    }
}
