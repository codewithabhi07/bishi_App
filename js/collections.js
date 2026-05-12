const Collections = {
    render(groupFilter = 'all') {
        const members = Store.getMembers();
        const groups = Store.getGroups();
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
            const targetAmount = group ? parseFloat(group.contribution) : 0;
            const paidAmount = Store.getMemberTotalPaid(member.id, currentMonth);
            
            const isFullyPaid = paidAmount >= targetAmount;
            const isPartial = paidAmount > 0 && paidAmount < targetAmount;

            let statusClass = 'pending';
            let statusText = 'Pending';
            
            if (isFullyPaid) {
                statusClass = 'paid';
                statusText = 'Paid';
            } else if (isPartial) {
                statusClass = 'warning';
                statusText = `Partial ($${paidAmount})`;
            }

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${member.name}</td>
                <td>$${targetAmount}</td>
                <td>${currentMonth}</td>
                <td>
                    <span class="status-pill status-${statusClass}">
                        ${statusText}
                    </span>
                </td>
                <td>
                    <button class="btn ${isFullyPaid ? 'btn-secondary' : 'btn-primary'}" 
                        ${isFullyPaid ? 'disabled' : ''} 
                        onclick="Collections.openPaymentModal('${member.id}', '${member.name}', ${targetAmount - paidAmount})">
                        ${isFullyPaid ? 'Collected' : 'Pay Now'}
                    </button>
                </td>
            `;
            body.appendChild(tr);
        });
    },

    openPaymentModal(memberId, memberName, remaining) {
        document.getElementById('pay-member-id').value = memberId;
        document.getElementById('pay-member-name').textContent = memberName;
        document.getElementById('pay-amount').value = remaining;
        document.getElementById('pay-late-fee').value = 0;
        UI.showModal('payment-modal');
    },

    handlePaymentSubmit(e) {
        e.preventDefault();
        const memberId = document.getElementById('pay-member-id').value;
        const amount = document.getElementById('pay-amount').value;
        const lateFee = document.getElementById('pay-late-fee').value;
        const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
        
        const member = Store.getMembers().find(m => m.id === memberId);

        // Record main payment
        Store.addTransaction({
            memberId,
            memberName: member.name,
            amount,
            month: currentMonth,
            type: 'Payment',
            description: `Monthly contribution for ${currentMonth}`
        });

        // Record late fee if any
        if (parseFloat(lateFee) > 0) {
            Store.addTransaction({
                memberId,
                memberName: member.name,
                amount: lateFee,
                month: currentMonth,
                type: 'Fee',
                description: `Late fee for ${currentMonth}`
            });
        }

        UI.closeModal();
        this.render(document.getElementById('collection-group-filter').value);
        UI.showToast(`Payment recorded for ${member.name}`);
        
        // Update dashboard if visible
        if (typeof Dashboard !== 'undefined') Dashboard.render();
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const filter = document.getElementById('collection-group-filter');
    if (filter) {
        filter.addEventListener('change', (e) => {
            Collections.render(e.target.value);
        });
    }

    const paymentForm = document.getElementById('payment-form');
    if (paymentForm) {
        paymentForm.addEventListener('submit', (e) => Collections.handlePaymentSubmit(e));
    }
});
