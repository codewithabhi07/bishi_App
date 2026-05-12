const Draw = {
    render() {
        const groups = Store.getGroups();
        const select = document.getElementById('draw-group-select');
        const historyList = document.getElementById('draw-history-list');
        
        // Refresh history
        this.renderHistory();

        // Update stats when group changes
        select.addEventListener('change', () => {
            this.updateDrawStats(select.value);
        });
    },

    updateDrawStats(groupId) {
        if (!groupId) {
            document.getElementById('draw-total-members').textContent = '0';
            document.getElementById('draw-remaining-members').textContent = '0';
            return;
        }

        const members = Store.getMembers().filter(m => m.groupId === groupId);
        const history = Store.getDrawHistory().filter(h => h.groupId === groupId);
        
        // Current cycle members who haven't won
        const winnersInCurrentCycle = history.map(h => h.memberId);
        const remaining = members.filter(m => !winnersInCurrentCycle.includes(m.id));

        document.getElementById('draw-total-members').textContent = members.length;
        document.getElementById('draw-remaining-members').textContent = remaining.length;

        // If remaining is 0, it means cycle is complete
        if (members.length > 0 && remaining.length === 0) {
            UI.showToast('Cycle complete! Next draw will reset the cycle.', 'warning');
        }
    },

    async performDraw() {
        const groupId = document.getElementById('draw-group-select').value;
        if (!groupId) {
            UI.showToast('Please select a group', 'error');
            return;
        }

        const members = Store.getMembers().filter(m => m.groupId === groupId);
        if (members.length === 0) {
            UI.showToast('No members in this group', 'error');
            return;
        }

        const history = Store.getDrawHistory().filter(h => h.groupId === groupId);
        let winnersInCurrentCycle = history.map(h => h.memberId);
        
        // If everyone has won, reset cycle (this is a simplified logic for SPA)
        let eligibleMembers = members.filter(m => !winnersInCurrentCycle.includes(m.id));
        
        if (eligibleMembers.length === 0) {
            // Cycle reset - logically we could archive previous history or just ignore it for the new cycle
            eligibleMembers = members;
            UI.showToast('Starting new cycle...');
        }

        // Animation start
        const btn = document.getElementById('start-draw-btn');
        btn.disabled = true;
        btn.textContent = 'Selecting Winner...';

        // Simulate "Rolling" effect
        await new Promise(resolve => setTimeout(resolve, 2000));

        const winner = eligibleMembers[Math.floor(Math.random() * eligibleMembers.length)];

        // Save Draw
        const group = Store.getGroups().find(g => g.id === groupId);
        const drawRecord = {
            groupId,
            groupName: group.name,
            memberId: winner.id,
            memberName: winner.name,
            amount: group.contribution * members.length
        };

        Store.addDrawRecord(drawRecord);
        
        // Record as a transaction (Payout)
        Store.addTransaction({
            memberId: winner.id,
            memberName: winner.name,
            amount: drawRecord.amount,
            type: 'Payout',
            description: `Winner of ${group.name} monthly draw`
        });

        // Show Result
        this.showWinnerUI(winner.name);
        
        // Reset UI
        btn.disabled = false;
        btn.textContent = 'Roll the Dice!';
        this.updateDrawStats(groupId);
        this.renderHistory();
    },

    showWinnerUI(name) {
        document.getElementById('winner-name-display').textContent = name;
        UI.showModal('winner-modal');
        
        // Confetti
        if (typeof confetti === 'function') {
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#6366f1', '#ec4899', '#10b981', '#f59e0b']
            });
        }
    },

    renderHistory() {
        const history = Store.getDrawHistory();
        const container = document.getElementById('draw-history-list');
        container.innerHTML = '';

        if (history.length === 0) {
            container.innerHTML = '<p class="empty-msg">No draws performed yet.</p>';
            return;
        }

        history.forEach(h => {
            const item = document.createElement('div');
            item.className = 'activity-item';
            item.innerHTML = `
                <div class="stat-icon" style="width: 40px; height: 40px; font-size: 1rem;"><i class="fas fa-trophy"></i></div>
                <div>
                    <p><strong>${h.memberName}</strong> won $${h.amount}</p>
                    <small>${h.groupName} • ${new Date(h.timestamp).toLocaleDateString()}</small>
                </div>
            `;
            container.appendChild(item);
        });
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const drawBtn = document.getElementById('start-draw-btn');
    if (drawBtn) {
        drawBtn.addEventListener('click', () => Draw.performDraw());
    }
});
