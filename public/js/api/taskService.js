export async function fetchTasks(page = 1, perPage = 10) {
    try {
        console.log("fetchTasks called", page, perPage)  // 确认调用
        const res = await axios.get('/api/tasks/queue?page='+page +'&per_page='+ perPage)
        if (res.data.code === 200) {
            return res.data.data
        }
        return { items: [], total: 0 }
    } catch (err) {
        console.error(err)
        return { items: [], total: 0 }
    }
}
