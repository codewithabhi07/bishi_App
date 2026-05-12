const Draw = {
    async render() {
        const select = document.getElementById('draw-group-select');
        await this.renderHistory();
        select.addEventListener('change', async () => {
            await this.updateDrawStats(select.value);
        });
    },

    async updateDrawStats(groupId) {
        if (!groupId) {
            document.getElementById('draw-total-members').textContent = '0';
            document.getElementById('draw-remaining-members').textContent = '0';
            document.getElementById('eligible-names').innerHTML = '';
            return;
        }

        const members = (await Store.getMembers()).filter(m => m.groupId === groupId);
        const history = (await Store.getDrawHistory()).filter(h => h.groupId === groupId);
        
        const winnersInCurrentCycle = history.map(h => h.memberId);
        const remaining = members.filter(m => !winnersInCurrentCycle.includes(m.id));

        document.getElementById('draw-total-members').textContent = members.length;
        document.getElementById('draw-remaining-members').textContent = remaining.length;

        const namesContainer = document.getElementById('eligible-names');
        namesContainer.innerHTML = '';
        
        if (remaining.length === 0 && members.length > 0) {
            namesContainer.innerHTML = '<span class="status-pill status-paid">All members have won! Cycle complete.</span>';
        } else {
            remaining.forEach(m => {
                const span = document.createElement('span');
                span.className = 'status-pill status-pending';
                span.style.padding = '4px 10px';
                span.textContent = m.name;
                namesContainer.appendChild(span);
            });
        }

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

        const members = (await Store.getMembers()).filter(m => m.groupId === groupId);
        if (members.length === 0) {
            UI.showToast('No members in this group', 'error');
            return;
        }

        const history = (await Store.getDrawHistory()).filter(h => h.groupId === groupId);
        let winnersInCurrentCycle = history.map(h => h.memberId);
        let eligibleMembers = members.filter(m => !winnersInCurrentCycle.includes(m.id));
        
        if (eligibleMembers.length === 0) {
            eligibleMembers = members;
            UI.showToast('Starting new cycle...');
        }

        const btn = document.getElementById('start-draw-btn');
        const spinnerContainer = document.getElementById('draw-spinner-container');
        const nameShuffler = document.getElementById('draw-name-shuffler');
        
        btn.disabled = true;
        spinnerContainer.classList.remove('hidden');

        let shuffleInterval = setInterval(() => {
            const randomMember = members[Math.floor(Math.random() * members.length)];
            nameShuffler.textContent = randomMember.name;
        }, 100);

        await new Promise(resolve => setTimeout(resolve, 3000));
        clearInterval(shuffleInterval);

        const winner = eligibleMembers[Math.floor(Math.random() * eligibleMembers.length)];
        nameShuffler.textContent = winner.name;
        nameShuffler.style.color = 'var(--success)';

        await new Promise(resolve => setTimeout(resolve, 1000));

        const groups = await Store.getGroups();
        const group = groups.find(g => g.id === groupId);
        
        const drawRecord = {
            groupId,
            groupName: group.name,
            memberId: winner.id,
            memberName: winner.name,
            amount: group.contribution * members.length
        };

        await Store.addDrawRecord(drawRecord);
        await Store.addTransaction({
            memberId: winner.id,
            memberName: winner.name,
            amount: drawRecord.amount,
            type: 'Payout',
            description: `Winner of ${group.name} monthly draw`
        });

        this.showWinnerUI(winner.name);
        btn.disabled = false;
        spinnerContainer.classList.add('hidden');
        nameShuffler.style.color = '';
        await this.updateDrawStats(groupId);
        await this.renderHistory();
    },

    showWinnerUI(name) {
        document.getElementById('winner-name-display').textContent = name;
        UI.showModal('winner-modal');
        if (typeof confetti === 'function') {
            confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
        }
    },

    async renderHistory() {
        const history = await Store.getDrawHistory();
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
        drawBtn.addEventListener('click', async () => await Draw.performDraw());
    }
});
