/**
 * 获取JMComic列表
 * @param {string} type - 类型: last(最新漫画), view(游览最高), like(点赞最多), picture(最多图片)
 * @param {number} page - 页码
 * @returns {Promise<Object>} - 接口返回结果
 */
export async function fetchJmList(type = 'last', page = 1) {
  try {
    const res = await axios.get('/api/jm/list', {
      params: { type, page }
    })
    return res.data
  } catch (error) {
    console.error('❌ 获取JM列表失败:', error)
    return {
      code: 500,
      message: '请求失败',
      data: { items: [], total: 0, page: 1, per_page: 10 }
    }
  }
}


export async function fetchJmDetail(jmId) {
  const res = await axios.get(`/api/jm/get/${jmId}`)
  return res.data
}