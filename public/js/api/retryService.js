// 重新下载
export async function retryById(id) {
  try {
    const res = await axios.post(`/api/downloads/retry`, {
      jm_comic_ids: id  // 这里放到请求体里
    })
    return res.data
  } catch (err) {
    console.error(err)
    return { code: 500, message: '下载失败' }
  }
}
