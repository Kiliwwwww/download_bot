import { searchJmComic } from '../api/searchService.js'
import {createJmDetailModal} from '/public/js/model/JmDetailModal.js'
import {createJmBottomBarComponent} from '/public/js/model/JmBottomBarComponent.js'
export function createSearchPage(Vue, naive) {
    const { ref, onMounted, computed, watch } = Vue
    const { NInput, NButton, NCard, useMessage, useLoadingBar, NPagination } = naive
    const privacyMode = ref(localStorage.getItem('privacyMode') === 'true')
    watch(privacyMode, val => localStorage.setItem('privacyMode', val))
    const JmDetailModal = createJmDetailModal(naive, privacyMode)
    const JmBottomBarComponent= createJmBottomBarComponent(naive)
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
            const query = ref('')
            const results = ref([])
            const hoverItem = ref('')
            const message = useMessage()
            const loadingBar = useLoadingBar()
            const searchInput = ref(null)
            const page = ref(1)
            const total = ref(0)
            const perPage = ref(80)
            const totalPages = computed(() => Math.ceil(total.value / perPage.value))
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
                    const res = await searchJmComic(val, page.value)
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
                // 页面打开自动聚焦
                if (searchInput.value) {
                    searchInput.value.focus()
                }
            })

            return { query, results, hoverItem, handleSearch, filterInput, goToDownload, searchInput, page, perPage, total, totalPages, JmDetailModal, JmBottomBarComponent}
        },
        components: { NInput, NButton, NCard,NPagination }
    }
}
