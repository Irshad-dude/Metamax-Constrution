/**
 * Data Manager for MetaMax Construction
 * Handles persistence using Backend API (Node.js + MongoDB)
 */

class DataManager {
    constructor() {
        this.API_URL = '/api';
        this.token = localStorage.getItem('metamax_admin_token') || null;
    }

    // Authorization Header
    getAuthHeader() {
        return this.token ? { 'Authorization': `Bearer ${this.token}` } : {};
    }

    // --- Authentication ---
    async login(username, password) {
        try {
            const response = await fetch(`${this.API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await response.json();
            if (data.success) {
                this.token = data.token;
                localStorage.setItem('metamax_admin_token', data.token);
                return { success: true, user: data.username };
            } else {
                return { success: false, message: data.message };
            }
        } catch (error) {
            return { success: false, message: 'Connection Error' };
        }
    }

    logout() {
        this.token = null;
        localStorage.removeItem('metamax_admin_token');
    }

    // --- Projects ---
    async getAllProjects() {
        try {
            const res = await fetch(`${this.API_URL}/projects`);
            return await res.json();
        } catch (e) {
            console.error(e);
            return [];
        }
    }

    async getProject(id) {
        try {
            const res = await fetch(`${this.API_URL}/projects/${id}`);
            return await res.json();
        } catch (e) { console.error(e); return { success: false }; }
    }

    async addProject(projectData) {
        try {
            const isFormData = projectData instanceof FormData;
            const res = await fetch(`${this.API_URL}/projects`, {
                method: 'POST',
                headers: isFormData ? this.getAuthHeader() : { ...this.getAuthHeader(), 'Content-Type': 'application/json' },
                body: isFormData ? projectData : JSON.stringify(projectData)
            });
            return await res.json();
        } catch (e) {
            console.error(e);
            return { success: false };
        }
    }

    async updateProject(id, updates) {
        try {
            const isFormData = updates instanceof FormData;
            const res = await fetch(`${this.API_URL}/projects/${id}`, {
                method: 'PUT',
                headers: isFormData ? this.getAuthHeader() : { ...this.getAuthHeader(), 'Content-Type': 'application/json' },
                body: isFormData ? updates : JSON.stringify(updates)
            });
            return await res.json();
        } catch (e) { console.error(e); return { success: false }; }
    }

    async deleteProject(id) {
        try {
            const res = await fetch(`${this.API_URL}/projects/${id}`, {
                method: 'DELETE',
                headers: this.getAuthHeader()
            });
            return await res.json();
        } catch (e) { console.error(e); return { success: false }; }
    }

    // --- Sectors ---
    async getAllSectors() {
        try {
            const res = await fetch(`${this.API_URL}/sectors`);
            return await res.json();
        } catch (e) { console.error(e); return []; }
    }

    async getSector(id) {
        try {
            const res = await fetch(`${this.API_URL}/sectors/${id}`);
            return await res.json();
        } catch (e) { console.error(e); return { success: false }; }
    }

    async addSector(sectorData) {
        try {
            const isFormData = sectorData instanceof FormData;
            const res = await fetch(`${this.API_URL}/sectors`, {
                method: 'POST',
                headers: isFormData ? this.getAuthHeader() : { ...this.getAuthHeader(), 'Content-Type': 'application/json' },
                body: isFormData ? sectorData : JSON.stringify(sectorData)
            });
            return await res.json();
        } catch (e) { console.error(e); return { success: false }; }
    }

    async updateSector(id, updates) {
        try {
            const isFormData = updates instanceof FormData;
            const res = await fetch(`${this.API_URL}/sectors/${id}`, {
                method: 'PUT',
                headers: isFormData ? this.getAuthHeader() : { ...this.getAuthHeader(), 'Content-Type': 'application/json' },
                body: isFormData ? updates : JSON.stringify(updates)
            });
            return await res.json();
        } catch (e) { console.error(e); return { success: false }; }
    }

    async deleteSector(id) {
        try {
            const res = await fetch(`${this.API_URL}/sectors/${id}`, {
                method: 'DELETE',
                headers: this.getAuthHeader()
            });
            return await res.json();
        } catch (e) { console.error(e); return { success: false }; }
    }

    // --- Dashboard ---
    async getStats() {
        try {
            const res = await fetch(`${this.API_URL}/dashboard/stats`, {
                headers: this.getAuthHeader()
            });
            return await res.json();
        } catch (e) { return { success: false }; }
    }
}

// Export a single instance
const db = new DataManager();
