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
            document.querySelector('#theme-toggle i').classList.replace('fa-moon', 'fa-sun');
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

    static switchSection(sectionId) {
        const sections = document.querySelectorAll('.content-section');
        sections.forEach(s => s.classList.remove('active'));
        
        const target = document.getElementById(sectionId);
        if (target) {
            target.classList.add('active');
            this.updateSectionTitle(sectionId.charAt(0).toUpperCase() + sectionId.slice(1));
            this.setActiveNavLink(sectionId);
        }
        
        // Auto-close sidebar on mobile
        if (window.innerWidth <= 992) {
            document.querySelector('.sidebar').classList.remove('active');
        }
    }
}

// Global Event Listeners for UI components
document.addEventListener('DOMContentLoaded', () => {
    // Theme Toggle
    document.getElementById('theme-toggle').addEventListener('click', () => UI.toggleTheme());
    
    // Mobile Sidebar Toggle
    document.getElementById('mobile-toggle').addEventListener('click', () => {
        document.querySelector('.sidebar').classList.toggle('active');
        document.getElementById('sidebar-overlay').classList.toggle('active');
    });

    document.getElementById('sidebar-overlay').addEventListener('click', () => {
        document.querySelector('.sidebar').classList.remove('active');
        document.getElementById('sidebar-overlay').classList.remove('active');
    });

    // Section Routing
    document.querySelectorAll('.nav-link[data-section]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = link.getAttribute('data-section');
            UI.switchSection(section);
            
            // Explicitly close sidebar and overlay on mobile after selection
            document.querySelector('.sidebar').classList.remove('active');
            document.getElementById('sidebar-overlay').classList.remove('active');
        });
    });

    UI.loadTheme();
});
