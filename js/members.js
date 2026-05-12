const Members = {
    async render(searchTerm = '') {
        const members = await Store.getMembers();
        const groups = await Store.getGroups();
        const body = document.getElementById('members-body');
        body.innerHTML = '';

        const filteredMembers = members.filter(m => 
            m.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

        if (filteredMembers.length === 0) {
            body.innerHTML = '<tr><td colspan="5" class="empty-msg">No members found</td></tr>';
            return;
        }

        filteredMembers.forEach(member => {
            const group = groups.find(g => g.id === member.groupId);
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>
                    <div class="td-flex">
                        <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=random" style="width: 32px; height: 32px; border-radius: 50%;">
                        <span>${member.name}</span>
                    </div>
                </td>
                <td>${group ? group.name : 'Unknown'}</td>
                <td>$${group ? group.contribution : 0}</td>
                <td><span class="status-pill status-paid">Active</span></td>
                <td>
                    <button onclick="Members.delete('${member.id}')" class="icon-btn danger-text"><i class="fas fa-trash"></i></button>
                </td>
            `;
            body.appendChild(tr);
        });
    },

    async delete(id) {
        if (confirm('Are you sure you want to remove this member?')) {
            await Store.deleteMember(id);
            await this.render();
            UI.showToast('Member removed', 'warning');
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const addMemberBtn = document.getElementById('add-member-btn');
    const memberForm = document.getElementById('member-form');

    if (addMemberBtn) {
        addMemberBtn.addEventListener('click', async () => {
            const groups = await Store.getGroups();
            if (groups.length === 0) {
                UI.showToast('Please create a group first!', 'error');
                return;
            }
            await Groups.updateDropdowns();
            UI.showModal('member-modal');
        });
    }

    if (memberForm) {
        memberForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const memberData = {
                name: document.getElementById('member-name').value,
                email: document.getElementById('member-email').value,
                groupId: document.getElementById('member-group-select').value
            };

            await Store.addMember(memberData);
            UI.closeModal();
            memberForm.reset();
            await Members.render();
            UI.showToast('Member added successfully!');
        });
    }
});
