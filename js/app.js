/**
 * Main App Entry Point
 */
const App = {
    init() {
        console.log("BishiPro Initializing...");
        
        // Load initial data if none exists
        this.checkInitialData();
        
        // Register Global Event Listeners
        this.registerEventListeners();
    },

    checkInitialData() {
        if (Store.getGroups().length === 0) {
            console.log("No groups found. Ready for new setup.");
        }
    },

    registerEventListeners() {
        // Global search member
        const searchInput = document.getElementById('member-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                if (typeof Members !== 'undefined') {
                    Members.render(e.target.value);
                }
            });
        }

        // Export Data
        const exportBtn = document.getElementById('export-data-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportData());
        }

        // Section change listeners to refresh data
        document.querySelectorAll('.nav-link[data-section]').forEach(link => {
            link.addEventListener('click', (e) => {
                const section = link.getAttribute('data-section');
                this.refreshSection(section);
            });
        });
    },

    refreshSection(section) {
        switch(section) {
            case 'dashboard':
                if (typeof Dashboard !== 'undefined') Dashboard.render();
                break;
            case 'groups':
                if (typeof Groups !== 'undefined') Groups.render();
                break;
            case 'members':
                if (typeof Members !== 'undefined') Members.render();
                break;
            case 'collections':
                if (typeof Collections !== 'undefined') Collections.render();
                break;
            case 'draw':
                if (typeof Draw !== 'undefined') Draw.render();
                break;
            case 'history':
                this.renderHistory();
                break;
            case 'reports':
                if (typeof Dashboard !== 'undefined') Dashboard.renderReports();
                break;
            case 'settings':
                this.loadSettings();
                break;
        }
    },

    renderHistory() {
        const transactions = Store.getTransactions();
        const body = document.getElementById('history-body');
        body.innerHTML = '';

        if (transactions.length === 0) {
            body.innerHTML = '<tr><td colspan="5" class="empty-msg">No transactions found</td></tr>';
            return;
        }

        transactions.forEach(t => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${new Date(t.date).toLocaleDateString()}</td>
                <td>${t.memberName}</td>
                <td><span class="status-pill status-${t.type.toLowerCase()}">${t.type}</span></td>
                <td>$${t.amount}</td>
                <td>${t.description}</td>
            `;
            body.appendChild(tr);
        });
    },

    loadSettings() {
        const user = Store.getCurrentUser();
        if (user) {
            document.getElementById('settings-name').value = user.name;
            document.getElementById('settings-email').value = user.email;
        }
    },

    exportData() {
        const data = {
            users: Store.getUsers(),
            groups: Store.getGroups(),
            members: Store.getMembers(),
            transactions: Store.getTransactions(),
            drawHistory: Store.getDrawHistory()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bishipro_backup_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        UI.showToast('Data exported successfully!');
    }
};

// Start the app
document.addEventListener('DOMContentLoaded', () => App.init());
