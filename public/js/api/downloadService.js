export async function downloadById(id) {
  try {
    const res = await axios.post(`/api/downloads`, {
      jm_comic_ids: id  // 这里放到请求体里
    })
    return res.data
  } catch (err) {
    console.error(err)
    return { code: 500, message: '下载失败' }
  }
}
