document.addEventListener('DOMContentLoaded', () => {
    const tabs = document.querySelectorAll('.history-tab');
    const cards = document.querySelectorAll('.history-card');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs
            tabs.forEach(t => t.classList.remove('active'));
            // Add active class to clicked tab
            tab.classList.add('active');

            const filter = tab.getAttribute('data-filter');

            cards.forEach(card => {
                if (filter === 'semua' || card.getAttribute('data-status') === filter) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
});
