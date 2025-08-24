export async function downloadById(id) {
  try {
    const res = await axios.post(`/api/downloads/${id}`)
    return res.data
  } catch (err) {
    console.error(err)
    return { code: 500, message: '下载失败' }
  }
}
