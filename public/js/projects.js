document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('projects-grid');
    const searchInput = document.getElementById('search-input');
    const tabBtns = document.querySelectorAll('.tab-btn');

    let currentCategory = 'all';
    let searchTerm = '';

    // Initial Render
    render();

    // --- Event Listeners ---

    // Filter Tabs
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update Active State
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Update State & Render
            currentCategory = btn.getAttribute('data-filter');
            render();
        });
    });

    // Search
    searchInput.addEventListener('input', (e) => {
        searchTerm = e.target.value.toLowerCase();
        render();
    });

    // --- Render Logic ---
    async function render() {
        const allProjects = await db.getAllProjects();

        // Filter Data
        const filtered = allProjects.filter(p => {
            const matchesCategory = currentCategory === 'all' || p.category === currentCategory;
            const matchesSearch = p.title.toLowerCase().includes(searchTerm) ||
                (p.description && p.description.toLowerCase().includes(searchTerm));
            return matchesCategory && matchesSearch;
        });

        // Update DOM
        if (filtered.length === 0) {
            grid.innerHTML = '<div class="no-results">No projects found matching your criteria.</div>';
            return;
        }

        grid.innerHTML = filtered.map(p => `
            <div class="project-card animate-in">
                <div class="card-image-wrapper">
                    <span class="category-tag">${getCategoryIcon(p.category)} ${p.category}</span>
                    <img src="${p.image || ''}" alt="${p.title}" loading="lazy" onerror="this.src='assets/images/placeholder.png'">
                </div>
                <div class="card-content">
                    <h3 class="card-title">${p.title}</h3>
                    <p class="card-desc">${p.description || 'No description available.'}</p>
                </div>
            </div>
        `).join('');
    }

    function getCategoryIcon(category) {
        const icons = {
            aviation: '✈️',
            commercial: '🏢',
            industrial: '🏭',
            infrastructure: '🚇'
        };
        return icons[category] || '📁';
    }
});
