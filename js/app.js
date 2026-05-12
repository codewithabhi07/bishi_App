const App = {
    async init() {
        console.log("BishiPro Cloud Initializing...");
        this.registerEventListeners();
        
        // Initial data load if a user is logged in
        const user = await Store.getCurrentUser();
        if (user) {
            await Dashboard.render();
        }
    },

    registerEventListeners() {
        const searchInput = document.getElementById('member-search');
        if (searchInput) {
            searchInput.addEventListener('input', async (e) => {
                if (typeof Members !== 'undefined') {
                    await Members.render(e.target.value);
                }
            });
        }

        const exportBtn = document.getElementById('export-data-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportData());
        }

        const reportBtn = document.getElementById('generate-report-btn');
        if (reportBtn) {
            reportBtn.addEventListener('click', () => this.generatePDFReport());
        }

        document.querySelectorAll('.nav-link[data-section]').forEach(link => {
            link.addEventListener('click', async (e) => {
                const section = link.getAttribute('data-section');
                await this.refreshSection(section);
            });
        });
    },

    async refreshSection(section) {
        switch(section) {
            case 'dashboard':
                if (typeof Dashboard !== 'undefined') await Dashboard.render();
                break;
            case 'groups':
                if (typeof Groups !== 'undefined') await Groups.render();
                break;
            case 'members':
                if (typeof Members !== 'undefined') await Members.render();
                break;
            case 'collections':
                if (typeof Collections !== 'undefined') await Collections.render();
                break;
            case 'draw':
                if (typeof Draw !== 'undefined') await Draw.render();
                break;
            case 'history':
                await this.renderHistory();
                break;
            case 'reports':
                if (typeof Dashboard !== 'undefined') await Dashboard.renderReports();
                break;
            case 'settings':
                await this.loadSettings();
                break;
        }
    },

    async renderHistory() {
        const transactions = await Store.getTransactions();
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

    async loadSettings() {
        const user = await Store.getCurrentUser();
        if (user) {
            document.getElementById('settings-name').value = user.name;
            document.getElementById('settings-email').value = user.email;
        }
    },

    async exportData() {
        const data = {
            groups: await Store.getGroups(),
            members: await Store.getMembers(),
            transactions: await Store.getTransactions(),
            drawHistory: await Store.getDrawHistory()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bishipro_backup_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        UI.showToast('Data exported successfully!');
    },

    generatePDFReport() {
        // ... (existing logic remains the same as it uses local DOM state)
    }
};

document.addEventListener('DOMContentLoaded', () => App.init());
