document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const loginScreen = document.getElementById('login-screen');
    const dashboard = document.getElementById('dashboard');
    const loginForm = document.getElementById('login-form');

    // Dashboard Elements
    const itemsGrid = document.getElementById('items-grid');
    const searchInput = document.getElementById('search-input');
    const btnAddNew = document.getElementById('btn-add-new');
    const statProjects = document.getElementById('stat-projects');
    const statSectors = document.getElementById('stat-sectors');

    // Upload/Form Elements
    const uploadContainer = document.getElementById('upload-container');
    const uploadZone = document.getElementById('upload-zone');
    const fileInput = document.getElementById('file-input');
    const uploadForm = document.getElementById('upload-form');
    const imagePreview = document.getElementById('image-preview');
    const cancelUpload = document.getElementById('cancel-upload');
    const formTitle = document.getElementById('form-title');
    const editIdInput = document.getElementById('edit-id');

    // State
    let currentImageBase64 = null;
    let activeTab = 'projects'; // 'projects' or 'sectors'

    // --- Initialization ---
    updateAnalytics();

    // Check if already logged in
    const token = localStorage.getItem('metamax_admin_token');
    if (token) {
        loginScreen.style.display = 'none';
        dashboard.style.display = 'grid';
        switchTab('projects');
        updateAnalytics();
    }

    // --- Tab Switching ---
    document.getElementById('tab-projects').addEventListener('click', () => switchTab('projects'));
    document.getElementById('tab-sectors').addEventListener('click', () => switchTab('sectors'));

    async function switchTab(tab) {
        activeTab = tab;
        document.getElementById('tab-projects').classList.toggle('active', tab === 'projects');
        document.getElementById('tab-sectors').classList.toggle('active', tab === 'sectors');

        document.getElementById('list-title').innerText = tab === 'projects' ? 'Existing Projects' : 'Existing Sectors';

        // Reset Search
        searchInput.value = '';

        updateCategoryOptions();
        await renderList();
        closeForm();
    }

    function updateCategoryOptions() {
        const select = document.getElementById('p-category');
        select.innerHTML = '';

        const options = activeTab === 'projects'
            ? [
                { val: 'aviation', txt: 'Aviation' },
                { val: 'commercial', txt: 'Commercial' },
                { val: 'industrial', txt: 'Industrial' },
                { val: 'infrastructure', txt: 'Infrastructure' }
            ]
            : [
                { val: 'aviation', txt: 'Aviation' },
                { val: 'datacenters', txt: 'Data Centers' },
                { val: 'metro', txt: 'Metro' },
                { val: 'commercial', txt: 'Commercial Real Estate' },
                { val: 'residential', txt: 'High-Rise Residential' },
                { val: 'industrial', txt: 'Industrial' }
            ];

        options.forEach(opt => {
            const el = document.createElement('option');
            el.value = opt.val;
            el.innerText = opt.txt;
            select.appendChild(el);
        });
    }

    // --- Authentication ---
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const user = document.getElementById('username').value;
        const pass = document.getElementById('password').value;

        const result = await db.login(user, pass);

        if (result.success) {
            loginScreen.style.display = 'none';
            dashboard.style.display = 'grid';
            switchTab('projects');
            updateAnalytics();
        } else {
            alert(result.message || 'Invalid credentials!');
        }
    });

    document.getElementById('logout-btn').addEventListener('click', () => {
        db.logout();
        location.reload();
    });

    // --- Analytics ---
    async function updateAnalytics() {
        const res = await db.getStats();
        if (res.success) {
            statProjects.innerText = res.data.projects;
            statSectors.innerText = res.data.sectors;
        } else {
            statProjects.innerText = '-';
            statSectors.innerText = '-';
        }
    }

    // --- Search Functionality ---
    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        renderList(term);
    });

    // --- Form Handling ---
    btnAddNew.addEventListener('click', () => {
        openForm();
    });

    cancelUpload.addEventListener('click', closeForm);

    function openForm(editItem = null) {
        uploadContainer.classList.add('active');
        uploadForm.reset();

        if (editItem) {
            // Edit Mode
            formTitle.innerText = activeTab === 'projects' ? 'Edit Project' : 'Edit Sector';
            editIdInput.value = editItem.id;
            document.getElementById('p-title').value = editItem.title;
            document.getElementById('p-category').value = editItem.category;
            document.getElementById('p-desc').value = editItem.description || '';

            if (editItem.image) {
                // If backend image, might need prefix
                currentImageBase64 = editItem.image;
                imagePreview.src = editItem.image;
                imagePreview.style.display = 'block';
            }
        } else {
            // Add Mode
            formTitle.textContent = `Add New ${type === 'projects' ? 'Project' : 'Sector'}`;
            submitBtn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Save Item';
        }

        uploadContainer.classList.add('active');
        uploadContainer.scrollIntoView({ behavior: 'smooth' });
    }

    function closeForm() {
        uploadContainer.classList.remove('active');
        uploadForm.reset();
        currentFile = null;
        currentImageBase64 = null;
        imagePreview.style.display = 'none';
        imagePreview.src = '';
    }

    // --- Drag & Drop Upload ---
    uploadZone.addEventListener('click', () => fileInput.click());

    uploadZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadZone.classList.add('dragover');
    });

    uploadZone.addEventListener('dragleave', () => {
        uploadZone.classList.remove('dragover');
    });

    uploadZone.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadZone.classList.remove('dragover');
        handleFile(e.dataTransfer.files[0]);
    });

    fileInput.addEventListener('change', (e) => {
        handleFile(e.target.files[0]);
    });

    function handleFile(file) {
        if (file && file.type.startsWith('image/')) {
            currentFile = file; // Store actual file for upload

            const reader = new FileReader();
            reader.onload = (e) => {
                currentImageBase64 = e.target.result;
                imagePreview.src = currentImageBase64;
                imagePreview.style.display = 'block';
            };
            reader.readAsDataURL(file);
        } else {
            alert('Please upload a valid image file.');
            currentFile = null;
            currentImageBase64 = null;
            imagePreview.style.display = 'none';
            imagePreview.src = '';
        }
    }

    // --- Form Submission ---
    uploadForm.addEventListener('submit', handleUpload);

    async function handleUpload(e) {
        e.preventDefault();

        const submitBtn = uploadForm.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Processing...';

        const id = editIdInput.value;
        const formData = new FormData();

        formData.append('title', document.getElementById('p-title').value);
        formData.append('category', document.getElementById('p-category').value);
        formData.append('description', document.getElementById('p-desc').value);

        if (currentFile) {
            formData.append('image', currentFile);
        } else if (currentImageBase64 && !id) { // Only append base64 if it's a new item and no file was selected
            // This case is for when an image was dragged/selected but then cleared,
            // or if we were editing and didn't change the image.
            // For editing, if currentFile is null, we assume the existing image should be kept by the backend.
            // If currentImageBase64 is a data URL, it means a new image was selected and then cleared.
            // If it's a URL from the backend, we don't re-send it unless it's a new item.
            // The backend should handle existing images if no new file is provided.
        }

        // For sectors, we might need isVisible - assuming default active for new
        if (activeTab === 'sectors') {
            // If we had a checkbox in form, we'd append it here
            // For now, assume default true for new, and backend handles existing
            // Or, if editing, the backend should preserve it unless explicitly changed.
            // For this example, we'll assume backend handles visibility on update if not provided.
            // If we wanted to explicitly set it for new, we'd do:
            // if (!id) formData.append('isVisible', 'true');
        }

        let result;
        try {
            if (activeTab === 'projects') {
                if (id) {
                    result = await db.updateProject(id, formData);
                } else {
                    result = await db.addProject(formData);
                }
            } else {
                // Sector
                if (id) {
                    result = await db.updateSector(id, formData);
                } else {
                    result = await db.addSector(formData);
                }
            }

            if (result && result.success) {
                showToast(`${activeTab === 'projects' ? 'Project' : 'Sector'} ${id ? 'Updated' : 'Created'} Successfully!`, 'success');
                closeForm();
                renderList(); // Refresh list to show changes
                updateAnalytics(); // Refresh stats
            } else {
                showToast(result.message || 'Operation failed', 'error');
            }
        } catch (error) {
            showToast('An unexpected error occurred', 'error');
            console.error(error);
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
        }
    }

    // Simple Toast Notification
    function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: ${type === 'success' ? '#28a745' : '#dc3545'};
            color: white;
            padding: 12px 24px;
            border-radius: 4px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            z-index: 1000;
            animation: slideIn 0.3s ease-out;
        `;
        toast.innerHTML = `<i class="fa-solid fa-${type === 'success' ? 'check' : 'circle-exclamation'}"></i> ${message}`;
        document.body.appendChild(toast);

        // Add keyframes if not exists (hacky but works)
        if (!document.getElementById('toast-style')) {
            const style = document.createElement('style');
            style.id = 'toast-style';
            style.innerHTML = `@keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`;
            document.head.appendChild(style);
        }

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.5s ease';
            setTimeout(() => toast.remove(), 500);
        }, 3000);
    }

    // --- Render List ---
    async function renderList(searchTerm = '') {
        const items = activeTab === 'projects' ? await db.getAllProjects() : await db.getAllSectors();

        // Filter
        const filtered = items.filter(item =>
            item.title.toLowerCase().includes(searchTerm) ||
            item.category.toLowerCase().includes(searchTerm)
        );

        itemsGrid.innerHTML = filtered.map(item => `
            <div class="item-card">
                <img src="${item.image || 'assets/images/placeholder.png'}" class="item-img" onerror="this.src='assets/images/placeholder.png'">
                <div class="item-content">
                    <span class="item-category">${item.category}</span>
                    <h4 class="item-title">${item.title}</h4>
                    <p class="item-desc">${item.description || 'No description'}</p>
                    
                    <div class="item-actions">
                        <button class="btn-icon" onclick="editItem('${item.id}')" title="Edit">
                            <i class="fa-solid fa-pen"></i>
                        </button>
                        <button class="btn-icon btn-delete" onclick="deleteItem('${item.id}')" title="Delete">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                        ${activeTab === 'sectors' ? `
                            <button class="btn-icon" onclick="toggleVisibility('${item.id}', ${item.isVisible})" title="Toggle Visibility">
                                <i class="fa-solid ${item.isVisible !== false ? 'fa-eye' : 'fa-eye-slash'}"></i>
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `).join('');
    }

    // --- Global Actions ---
    window.editItem = async (id) => {
        // Show loading feedback
        showToast('Fetching details...', 'success');

        let result;
        try {
            if (activeTab === 'projects') {
                result = await db.getProject(id);
            } else {
                result = await db.getSector(id);
            }

            if (result && result.success) {
                openForm(result.data);
                // Remove loading toast (optional, or it auto-hides)
            } else {
                showToast('Error loading details', 'error');
            }
        } catch (e) {
            console.error(e);
            showToast('Connection error', 'error');
        }
    };

    window.deleteItem = async (id) => {
        if (confirm('Are you sure you want to delete this item?')) {
            if (activeTab === 'projects') {
                await db.deleteProject(id);
            } else {
                await db.deleteSector(id);
            }
            await renderList();
            await updateAnalytics();
        }
    };

    window.toggleVisibility = async (id, currentStatus) => {
        const formData = new FormData(); // Or just JSON 
        // Using JSON for simpler updates if not uploading file
        // But our data manager handles FormData easily which Multer expects
        // Actually for toggle, simpler to use updateSector with JSON payload if backed supports it
        // Or just FormData
        await db.updateSector(id, { isVisible: !currentStatus }); // DB manager handles JSON stringify if not FormData
        await renderList();
    };
});
