// theme.js
export const themeOverrides = {
    common: {
        primaryColor: '#ff7eb9',        // 全局主题色改成粉色
        primaryColorHover: '#ff6aa1',
        primaryColorPressed: '#ff5890',
        primaryColorSuppl: '#ffd6e8'
    },
    LoadingBar: {
            // 颜色（支持十六进制、rgb、rgba、hsl 等）
            colorLoading: '#ff7eb9', // 加载中颜色
            colorSuccess: '#ff7eb9', // 成功颜色
            colorError: '#ff4d4f',   // 错误颜色
            colorWarning: '#faad14', // 警告颜色
            // 高度
            height: '3px',
            // 其他可覆盖的变量 (可选)
            // borderRadius: '2px',
            // opacity: '0.95'
        }
};
