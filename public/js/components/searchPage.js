import { searchJmComic } from '../api/searchService.js'

export function createSearchPage(Vue, naive) {
    const { ref, onMounted } = Vue
    const { NInput, NButton, NCard, useMessage, useLoadingBar } = naive

    return {
        template: `
        <div class="search-page">

            <!-- Logo -->
            <img src="/public/img/logo.webp" alt="logo" class="logo" />

            <!-- 搜索框 -->
            <div class="search-wrapper">
                <n-input
                    ref="searchInput"
                    v-model="query"
                    placeholder="请输入漫画名称"
                    class="search-input"
                    @input="filterInput"
                    @keyup.enter="handleSearch"
                />
                <div class="search-buttons">
                    <n-button 
                        @click="handleSearch"
                        class="search-button"
                    >
                        JMComic搜索
                    </n-button>
                    <n-button 
                        @click="handleSearch"
                        class="search-button"
                    >
                        手气不错
                    </n-button>
                </div>
            </div>

            <!-- 搜索结果 -->
            <div v-if="results.length" class="results">
                <n-card 
                    v-for="item in results" 
                    :key="item.jm_id" 
                    class="result-item"
                    @click="goToDownload(item.jm_id)"
                    @mouseenter="hoverItem = item.jm_id"
                    @mouseleave="hoverItem = ''"
                    :style="{ background: hoverItem === item.jm_id ? '#ffe6f0' : '#fff' }"
                >
                    <div>{{ item.title }}</div>
                </n-card>
            </div>

        </div>
        `,
        setup() {
            const query = ref('')
            const results = ref([])
            const hoverItem = ref('')
            const message = useMessage()
            const loadingBar = useLoadingBar()
            const searchInput = ref(null)

            const filterInput = (value) => {
                query.value = value.replace(/[^\w\u4e00-\u9fa5]/g, '')
            }

            const handleSearch = async () => {
                const val = query.value.trim()
                if (!val) {
                    message.warning('请输入搜索内容')
                    return
                }

                loadingBar.start()
                try {
                    const res = await searchJmComic(val)
                    if (res.code === 200) {
                        results.value = res.data.items || []
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
                // 页面打开自动聚焦
                if (searchInput.value) {
                    searchInput.value.focus()
                }
            })

            return { query, results, hoverItem, handleSearch, filterInput, goToDownload, searchInput }
        },
        components: { NInput, NButton, NCard }
    }
}
