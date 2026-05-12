class UI {
    static showToast(message, type = 'success') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    static toggleTheme() {
        const body = document.body;
        const icon = document.querySelector('#theme-toggle i');
        
        if (body.classList.contains('light-mode')) {
            body.classList.replace('light-mode', 'dark-mode');
            icon.classList.replace('fa-moon', 'fa-sun');
            localStorage.setItem('theme', 'dark');
        } else {
            body.classList.replace('dark-mode', 'light-mode');
            icon.classList.replace('fa-sun', 'fa-moon');
            localStorage.setItem('theme', 'light');
        }
    }

    static loadTheme() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            document.body.classList.replace('light-mode', 'dark-mode');
            const icon = document.querySelector('#theme-toggle i');
            if (icon) icon.classList.replace('fa-moon', 'fa-sun');
        }
    }

    static showModal(modalId) {
        const overlay = document.getElementById('modal-overlay');
        const modal = document.getElementById(modalId);
        
        overlay.classList.remove('hidden');
        modal.classList.remove('hidden');
    }

    static closeModal() {
        const overlay = document.getElementById('modal-overlay');
        const modals = document.querySelectorAll('.modal');
        
        overlay.classList.add('hidden');
        modals.forEach(m => m.classList.add('hidden'));
    }

    static updateSectionTitle(title) {
        document.getElementById('section-title').textContent = title;
    }

    static setActiveNavLink(section) {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-section') === section) {
                link.classList.add('active');
            }
        });
    }

    static async switchSection(sectionId) {
        const sections = document.querySelectorAll('.content-section');
        sections.forEach(s => s.classList.remove('active'));
        
        const target = document.getElementById(sectionId);
        if (target) {
            target.classList.add('active');
            this.updateSectionTitle(sectionId.charAt(0).toUpperCase() + sectionId.slice(1));
            this.setActiveNavLink(sectionId);
            
            // Trigger refresh for the section
            if (window.App) await window.App.refreshSection(sectionId);
        }
        
        if (window.innerWidth <= 992) {
            document.querySelector('.sidebar').classList.remove('active');
            const overlay = document.getElementById('sidebar-overlay');
            if (overlay) overlay.classList.remove('active');
        }
    }
}

// Global Event Listeners for UI components
document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) themeToggle.addEventListener('click', () => UI.toggleTheme());
    
    const mobileToggle = document.getElementById('mobile-toggle');
    if (mobileToggle) {
        mobileToggle.addEventListener('click', () => {
            document.querySelector('.sidebar').classList.toggle('active');
            document.getElementById('sidebar-overlay').classList.toggle('active');
        });
    }

    const sidebarOverlay = document.getElementById('sidebar-overlay');
    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', () => {
            document.querySelector('.sidebar').classList.remove('active');
            document.getElementById('sidebar-overlay').classList.remove('active');
        });
    }

    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', () => UI.closeModal());
    });

    const modalOverlay = document.getElementById('modal-overlay');
    if (modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
            if (e.target.id === 'modal-overlay') UI.closeModal();
        });
    }

    document.querySelectorAll('.nav-link[data-section]').forEach(link => {
        link.addEventListener('click', async (e) => {
            e.preventDefault();
            const section = link.getAttribute('data-section');
            await UI.switchSection(section);
        });
    });

    UI.loadTheme();
});

window.UI = UI;
