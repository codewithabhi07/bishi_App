const Dashboard = {
    render() {
        this.updateStats();
        this.renderRecentActivity();
        this.renderCharts();
    },

    updateStats() {
        const members = Store.getMembers();
        const transactions = Store.getTransactions();
        const draws = Store.getDrawHistory();

        const totalCollected = transactions
            .filter(t => t.type === 'Payment')
            .reduce((sum, t) => sum + parseFloat(t.amount), 0);

        const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
        const paidCount = transactions.filter(t => t.type === 'Payment' && t.month === currentMonth).length;
        const pendingCount = members.length - paidCount;

        document.getElementById('stat-total-members').textContent = members.length;
        document.getElementById('stat-total-collected').textContent = `$${totalCollected.toLocaleString()}`;
        document.getElementById('stat-pending-payments').textContent = Math.max(0, pendingCount);
        
        const nextDraw = draws.length > 0 ? 'Next Month' : 'Pending';
        document.getElementById('stat-next-draw').textContent = nextDraw;
    },

    renderRecentActivity() {
        const transactions = Store.getTransactions().slice(-5).reverse();
        const container = document.getElementById('recent-activity-list');
        container.innerHTML = '';

        if (transactions.length === 0) {
            container.innerHTML = '<p class="empty-msg">No recent activity</p>';
            return;
        }

        transactions.forEach(t => {
            const item = document.createElement('div');
            item.className = 'activity-item';
            const icon = t.type === 'Payment' ? 'fa-arrow-down' : 'fa-trophy';
            const color = t.type === 'Payment' ? 'var(--success)' : 'var(--primary-color)';
            
            item.innerHTML = `
                <div class="stat-icon" style="width: 35px; height: 35px; font-size: 0.9rem; background: ${color}"><i class="fas ${icon}"></i></div>
                <div>
                    <p><strong>${t.memberName}</strong> ${t.type === 'Payment' ? 'paid' : 'won'} $${t.amount}</p>
                    <small>${new Date(t.date).toLocaleTimeString()} • ${t.type}</small>
                </div>
            `;
            container.appendChild(item);
        });
    },

    renderCharts() {
        const ctx = document.getElementById('collectionChart');
        if (!ctx) return;

        // Destroy existing chart if it exists to avoid overlap
        if (window.colChart) window.colChart.destroy();

        const transactions = Store.getTransactions();
        const last6Months = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            last6Months.push(d.toLocaleString('default', { month: 'short' }));
        }

        // Mock data for trends based on real transactions if available
        const data = last6Months.map(m => {
            return transactions
                .filter(t => t.type === 'Payment' && new Date(t.date).toLocaleString('default', { month: 'short' }) === m)
                .reduce((sum, t) => sum + parseFloat(t.amount), 0);
        });

        window.colChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: last6Months,
                datasets: [{
                    label: 'Monthly Collections ($)',
                    data: data,
                    borderColor: '#6366f1',
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, grid: { display: false } },
                    x: { grid: { display: false } }
                }
            }
        });
    },

    renderReports() {
        // Additional charts for reports section
        const growthCtx = document.getElementById('growthChart');
        const distCtx = document.getElementById('groupDistChart');

        if (growthCtx) {
            if (window.growthChart) window.growthChart.destroy();
            window.growthChart = new Chart(growthCtx, {
                type: 'bar',
                data: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                    datasets: [{
                        label: 'Growth',
                        data: [12, 19, 3, 5, 2, 3],
                        backgroundColor: '#ec4899'
                    }]
                }
            });
        }

        if (distCtx) {
            if (window.distChart) window.distChart.destroy();
            const groups = Store.getGroups();
            const members = Store.getMembers();
            
            const labels = groups.map(g => g.name);
            const counts = groups.map(g => members.filter(m => m.groupId === g.id).length);

            window.distChart = new Chart(distCtx, {
                type: 'doughnut',
                data: {
                    labels: labels,
                    datasets: [{
                        data: counts,
                        backgroundColor: ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#ef4444']
                    }]
                }
            });
        }
    }
};
