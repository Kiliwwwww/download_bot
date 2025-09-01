export async function searchJmComic(name, page = 1) {
  try {
    const res = await axios.get('/api/jm/search', {
      params: { name, page }
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