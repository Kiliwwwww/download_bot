export const animateButton = function animateButton(buttonComponent, callback) {
    if (!buttonComponent || !buttonComponent.$el) return;
    const buttonEl = buttonComponent.$el;

    // 按钮抖动
    buttonEl.animate([
        { transform: 'translateX(0)' },
        { transform: 'translateX(-5px)' },
        { transform: 'translateX(5px)' },
        { transform: 'translateX(-5px)' },
        { transform: 'translateX(5px)' },
        { transform: 'translateX(0)' }
    ], { duration: 400, easing: 'ease-in-out' });

    // 延迟粒子效果
    setTimeout(() => {
        // 使用简单动画，避免操作 body
        buttonEl.style.transition = 'transform 0.3s';
        buttonEl.style.transform = 'scale(1.2)';
        setTimeout(() => {
            buttonEl.style.transform = 'scale(1)';
            callback && callback();
        }, 300);
    }, 400);
}
