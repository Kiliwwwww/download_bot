export async function fetchTasks() {
  try {
    const res = await axios.get('/api/tasks/queue')
    if (res.data.code === 200) {
      return res.data.data
    }
    return []
  } catch (err) {
    console.error(err)
    return []
  }
}
