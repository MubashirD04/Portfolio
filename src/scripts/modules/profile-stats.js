export function setupProfileStats() {
    const statsSection = document.querySelector('.game-card');
    if (!statsSection) return;

    const fillBars = statsSection.querySelectorAll('.fill');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                fillBars.forEach(bar => {
                    const val = bar.style.getPropertyValue('--val');
                    if (val) {
                        bar.style.width = val.trim();
                    }
                });
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    observer.observe(statsSection);
}
