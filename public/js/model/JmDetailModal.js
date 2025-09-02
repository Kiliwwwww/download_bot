// JmDetailModal.js
import {fetchJmDetail} from '../api/jmService.js'
import {downloadById} from '../api/downloadService.js'

export function createJmDetailModal(naive, privacyModeRef) {
    const {ref, onMounted, computed, onBeforeUnmount, watch} = Vue
    const {NModal, NCard, NButton, NSpin, useMessage, useLoadingBar} = naive
    const message = useMessage()
    const detailVisible = ref(false)
    const detail = ref(null)
    const detailLoading = ref(false)
    const previewVisible = ref(false)
    const previewSrc = ref('')
    const hoverBtn = ref(false)
    const hoverBtnView = ref(false)


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


    const JmDetailModalComponent = {
        template: `
        <n-modal v-model:show="detailVisible" style="width: 920px; max-width:95vw;">
          <n-card title="漫画详情" closable @close="detailVisible=false">
            <n-spin :show="detailLoading">
              <div v-if="detail" style="display:flex; gap:24px; flex-wrap:wrap; align-items:flex-start;">
                <!-- 左侧图片 -->
                <div style="flex:0 0 260px; text-align:center;">
                  <img :src="privacyModeRef ? '/public/img/logo.webp' : detail.img_url"
                       alt="封面"
                       style="width:100%; max-width:260px; border-radius:14px; box-shadow:0 6px 20px rgba(0,0,0,0.15); cursor:pointer;"
                       @click="showPreview(detail.img_url)" />
                </div>

                <!-- 全屏预览弹窗 -->
                <n-modal v-model:show="previewVisible" style="padding:0; max-width:95vw;" :mask-closable="true">
                  <img :src="previewSrc" style="height:100%; width:auto; display:block;" />
                </n-modal>

                <!-- 右侧信息 -->
                <div style="flex:1; display:flex; flex-direction:column; gap:12px;">
                  <h3 style="font-size:22px; font-weight:700; color:#ff7eb9; margin:0;">
                    #{{ detail.jm_id }} - {{ detail.name }}
                  </h3>

                  <!-- 基本信息 -->
                  
                  <div style="display:flex; flex-wrap:wrap; gap:8px; font-size:14px; color:#666;">
                    作者:
                    <a v-for="tag in detail.authors" :key="tag" @click="goto('author',tag)"
                          style="all: unset; cursor: pointer; text-decoration: none; background: linear-gradient(90deg,#ff7eb9,#ff758c); color:#fff; padding:2px 10px; border-radius:12px; font-size:12px;">
                      {{ tag }}
                    </a>
                    <a v-if="!detail.authors.length" style="color:#999;">未知</a> 
                  </div>
                  <div style="display:flex; flex-wrap:wrap; gap:8px; font-size:14px; color:#666;">
                    主角:
                    <a v-for="tag in detail.actors" :key="tag" @click="goto('actor',tag)"
                          style="all: unset; cursor: pointer; text-decoration: none; background: linear-gradient(90deg,#ff7eb9,#ff758c); color:#fff; padding:2px 10px; border-radius:12px; font-size:12px;">
                      {{ tag }}
                    </a>
                    <a v-if="!detail.actors.length" style="color:#999;">未知</a> 
                  </div>
                  
                  <div style="display:flex; flex-wrap:wrap; gap:12px; font-size:14px; color:#666;">
                  
                    
                    <span>上传时间: {{ detail.pub_date }}</span>
                    <span>更新时间: {{ detail.update_date }}</span>
                    <span>页数: {{ detail.page_count }}</span>
                    <span>点赞: {{ detail.likes }} | 浏览: {{ detail.views }} | 评论: {{ detail.comment_count }}</span>
                  </div>

                  <!-- 标签 -->
                  <div style="display:flex; flex-wrap:wrap; gap:8px; margin-top:6px;">
                    <a v-for="tag in detail.tags" :key="tag" @click="goto('tag',tag)"
                          style="margin-left: 5px; all: unset; cursor: pointer; text-decoration: none; background: linear-gradient(90deg,#ff7eb9,#ff758c); color:#fff; padding:2px 10px; border-radius:12px; font-size:12px;">
                      {{ tag }}
                    </a>
                    <a v-if="!detail.tags.length" style="color:#999;">无标签</a>
                  </div>

                  <!-- 简介 -->
                  <div v-if="detail.description" 
                       style="margin-top:10px; max-height:180px; overflow-y:auto; padding:12px; border-radius:10px; background:#fff0f6; box-shadow:inset 0 2px 6px rgba(0,0,0,0.05); font-size:14px; line-height:1.6; color:#444;">
                    {{ detail.description }}
                  </div>

                  <!-- 操作按钮 -->
                  <div style="margin-top:18px; display:flex; gap:14px;">
                    <n-button style="flex:1; padding:10px 16px; font-size:15px; border-radius:12px; background:linear-gradient(90deg, #ff7eb9, #ff758c); color:#fff; font-weight:600; box-shadow:0 4px 12px rgba(0,0,0,0.15); transition: transform 0.2s;" 
                              @mouseover.native="hoverBtn = true" @mouseleave.native="hoverBtn=false"
                              :style="hoverBtn ? 'transform:scale(1.05);' : ''"
                              @click="handleDownload(detail.jm_id)">
                      ⬇ 下载
                    </n-button>
                    <n-button style="flex:1; padding:10px 16px; font-size:15px; border-radius:12px; background:linear-gradient(90deg, #7ebfff, #758cff); color:#fff; font-weight:600; box-shadow:0 4px 12px rgba(0,0,0,0.15); transition: transform 0.2s;" 
                              @mouseover.native="hoverBtnView = true" @mouseleave.native="hoverBtnView=false"
                              :style="hoverBtnView ? 'transform:scale(1.05);' : ''"
                              @click="handleView(detail.jm_id)">
                      🔍 查看详情
                    </n-button>
                  </div>
                </div>
              </div>
              <div v-else style="text-align:center; padding:40px 0; color:#999;">暂无详情</div>
            </n-spin>
          </n-card>
        </n-modal>
        `,
        setup() {
            const loadingBar = useLoadingBar()

            const message = useMessage()
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
                window.open(`https://18comic.vip/album/${jmId}`, '_blank')
            }

            const showPreview = (src) => {
                previewSrc.value = privacyModeRef.value ? '/public/img/logo.webp' : src
                previewVisible.value = true
            }
            const goto = (type, q) => {
                window.location.href = '/admins/pages/search.html?type=' + type + '&query=' + q
            }
            return {
                detailVisible, detail, detailLoading,
                previewVisible, previewSrc, hoverBtn, hoverBtnView,
                showDetail, handleDownload, handleView, showPreview,
                privacyModeRef, goto
            }
        },
        components: {NModal, NCard, NButton, NSpin}
    }

    return JmDetailModalComponent
}
