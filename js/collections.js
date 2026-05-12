const Collections = {
    render(groupFilter = 'all') {
        const members = Store.getMembers();
        const groups = Store.getGroups();
        const transactions = Store.getTransactions();
        const body = document.getElementById('collections-body');
        body.innerHTML = '';

        const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

        let filteredMembers = members;
        if (groupFilter !== 'all') {
            filteredMembers = members.filter(m => m.groupId === groupFilter);
        }

        if (filteredMembers.length === 0) {
            body.innerHTML = '<tr><td colspan="5" class="empty-msg">No members found to track collections</td></tr>';
            return;
        }

        filteredMembers.forEach(member => {
            const group = groups.find(g => g.id === member.groupId);
            const isPaid = transactions.some(t => 
                t.memberId === member.id && 
                t.month === currentMonth && 
                t.type === 'Payment'
            );

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${member.name}</td>
                <td>$${group ? group.contribution : 0}</td>
                <td>${currentMonth}</td>
                <td>
                    <span class="status-pill status-${isPaid ? 'paid' : 'pending'}">
                        ${isPaid ? 'Paid' : 'Pending'}
                    </span>
                </td>
                <td>
                    ${isPaid ? 
                        `<button class="btn btn-secondary" disabled>Collected</button>` : 
                        `<button class="btn btn-primary" onclick="Collections.markPaid('${member.id}', '${group ? group.contribution : 0}')">Mark Paid</button>`
                    }
                </td>
            `;
            body.appendChild(tr);
        });
    },

    markPaid(memberId, amount) {
        const member = Store.getMembers().find(m => m.id === memberId);
        const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

        const transaction = {
            memberId,
            memberName: member.name,
            amount,
            month: currentMonth,
            type: 'Payment',
            description: `Monthly contribution for ${currentMonth}`
        };

        Store.addTransaction(transaction);
        this.render(document.getElementById('collection-group-filter').value);
        UI.showToast(`Payment collected from ${member.name}`);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const filter = document.getElementById('collection-group-filter');
    if (filter) {
        filter.addEventListener('change', (e) => {
            Collections.render(e.target.value);
        });
    }
});
