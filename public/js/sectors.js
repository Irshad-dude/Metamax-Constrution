document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('sectors-grid');
    const filterBtns = document.querySelectorAll('[data-sector-filter]');

    let currentFilter = 'all';

    // Initial Render
    renderSectors();

    // --- Event Listeners ---
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update Active State
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Update State & Render
            currentFilter = btn.getAttribute('data-sector-filter');
            renderSectors();
        });
    });

    // --- Render Logic ---
    async function renderSectors() {
        // Use async API call
        const allSectors = await db.getAllSectors();

        // Filter Data (Category + Visibility)
        const filtered = allSectors.filter(s => {
            const matchesCategory = currentFilter === 'all' || s.category === currentFilter;
            const isVisible = s.isVisible !== false; // Default to true if undefined
            return matchesCategory && isVisible;
        });

        // Update DOM
        if (filtered.length === 0) {
            grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 2rem;">No sectors found.</div>';
            return;
        }

        grid.innerHTML = filtered.map(s => `
            <div class="sector-card animate-in">
                <div class="sector-image" style="background-image: url('${s.image || ''}');"></div>
                <div class="sector-overlay">
                    <h3>${s.title}</h3>
                    ${s.description ? `<p style="font-size: 0.85rem; opacity: 0.9;">${s.description}</p>` : ''}
                </div>
            </div>
        `).join('');
    }
});
