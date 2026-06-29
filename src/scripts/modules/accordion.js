export function setupAccordion() {
    const projects = document.querySelectorAll('.project-card');
    projects.forEach((card, index) => {
        const header = card.querySelector('.accordion-header');
        if (header) {
            header.addEventListener('click', () => {
                const isActive = card.classList.contains('active');
                // Close all
                projects.forEach(p => p.classList.remove('active'));
                // Open if it wasn't active
                if (!isActive) {
                    card.classList.add('active');
                }
            });
        }
        
        // Open first by default
        if (index === 0) {
            card.classList.add('active');
        }
    });
}
