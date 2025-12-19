document.addEventListener('DOMContentLoaded', () => {
    // Mobile Menu Toggle
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const mainNav = document.querySelector('.main-nav');
    const navLinks = document.querySelectorAll('.nav-link');

    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
            menuToggle.setAttribute('aria-expanded', !isExpanded);
            mainNav.classList.toggle('active');

            // Animate hamburger to X
            menuToggle.classList.toggle('open');
        });
    }

    // Close menu when clicking a link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            mainNav.classList.remove('active');
            menuToggle.setAttribute('aria-expanded', 'false');
            menuToggle.classList.remove('open');
        });
    });

    // Smooth Scroll for Anchor Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const headerOffset = 80;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Intersection Observer for Animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe elements
    document.querySelectorAll('.section-title, .service-card, .sector-card, .value-card, .why-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        observer.observe(el);
    });

    // Add animation class styles dynamically
    const style = document.createElement('style');
    style.textContent = `
        .animate-in {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
        
        .mobile-menu-toggle.open .bar:nth-child(1) {
            transform: rotate(45deg) translate(5px, 6px);
        }
        .mobile-menu-toggle.open .bar:nth-child(2) {
            opacity: 0;
        }
        .mobile-menu-toggle.open .bar:nth-child(3) {
            transform: rotate(-45deg) translate(5px, -6px);
        }
    `;
    document.head.appendChild(style);

    // Cookie Consent
    const cookieConsent = document.getElementById('cookie-consent');
    const acceptCookies = document.getElementById('accept-cookies');

    if (!localStorage.getItem('cookieConsent')) {
        setTimeout(() => {
            cookieConsent.classList.add('show');
        }, 2000);
    }

    if (acceptCookies) {
        acceptCookies.addEventListener('click', () => {
            localStorage.setItem('cookieConsent', 'true');
            cookieConsent.classList.remove('show');
        });
    }

    // --- Dynamic Projects Loader ---
    const projectsGrid = document.getElementById('projects-grid');
    const filterBtns = document.querySelectorAll('.project-filter-btn');

    // Load Projects
    loadProjects();

    async function loadProjects() {
        // Show Skeleton (already in HTML via CSS classes hopefully, otherwise add styles)

        try {
            const data = await db.getAllProjects();
            // Handle if data is wrapped in object or is error
            const projects = Array.isArray(data) ? data : (data.data && Array.isArray(data.data) ? data.data : []);

            if (!projects || projects.length === 0) {
                projectsGrid.innerHTML = '<div class="no-results">No projects found.</div>';
                return;
            }

            const icons = {
                aviation: '✈️',
                commercial: '🏢',
                industrial: '🏭',
                infrastructure: '🚇',
                residential: '🏠', // Added residential
                datacenters: '💾', // Added datacenters
                metro: '🚆' // Added metro
            };

            projectsGrid.innerHTML = projects.map(p => {
                // Determine Image URL
                let imgUrl = 'assets/images/placeholder.png';
                if (p.image) {
                    // Normalize Image Path
                    if (p.image.startsWith('http') || p.image.startsWith('data:')) {
                        imgUrl = p.image;
                    } else if (p.image.startsWith('/uploads')) {
                        imgUrl = p.image;
                    } else {
                        imgUrl = `/uploads/${p.image.replace(/^\//, '')}`; // Ensure cleaner path
                    }
                }

                // Fallback for icon
                const icon = icons[p.category.toLowerCase()] || '📁';

                return `
                    <div class="project-card" data-category="${p.category.toLowerCase()}">
                        <div class="project-image">
                            <span class="category-tag">${icon} ${p.category}</span>
                            <img src="${imgUrl}" alt="${p.title}" loading="lazy" onerror="this.src='assets/images/placeholder.png'">
                        </div>
                        <div class="project-info">
                            <h3>${p.title}</h3>
                            <p class="project-category-label">${p.category.charAt(0).toUpperCase() + p.category.slice(1)}</p>
                            <p class="project-client">${p.description ? (p.description.length > 100 ? p.description.substring(0, 100) + '...' : p.description) : ''}</p>
                        </div>
                    </div>
                `;
            }).join('');

            // Trigger Animation
            const cards = document.querySelectorAll('.project-card');
            cards.forEach((card, index) => {
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';
                setTimeout(() => {
                    card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, index * 100);
            });

        } catch (error) {
            console.error(error);
            projectsGrid.innerHTML = '<div class="error-msg">Failed to load projects.</div>';
        }
    }

    // Filter Logic
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filterValue = btn.getAttribute('data-filter');
            const projectCards = document.querySelectorAll('.project-card');

            projectCards.forEach(card => {
                const category = card.getAttribute('data-category');

                if (filterValue === 'all' || category === filterValue) {
                    card.style.display = 'block';
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    }, 50);
                } else {
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(20px)';
                    setTimeout(() => {
                        card.style.display = 'none';
                    }, 300);
                }
            });
        });
    });
});
