const Groups = {
    async render() {
        const groups = await Store.getGroups();
        const allMembers = await Store.getMembers();
        const container = document.getElementById('groups-list');
        container.innerHTML = '';

        if (groups.length === 0) {
            container.innerHTML = '<p class="empty-msg">No groups created yet. Click "New Group" to start.</p>';
            return;
        }

        groups.forEach(group => {
            const members = allMembers.filter(m => m.groupId === group.id);
            const card = document.createElement('div');
            card.className = 'group-card glass';
            card.innerHTML = `
                <div class="group-header">
                    <h3>${group.name}</h3>
                    <button onclick="Groups.delete('${group.id}')" class="icon-btn danger-text"><i class="fas fa-trash"></i></button>
                </div>
                <div class="group-info">
                    <p><i class="fas fa-money-bill"></i> Contribution: $${group.contribution}/mo</p>
                    <p><i class="fas fa-users"></i> Members: ${members.length}</p>
                    <p><i class="fas fa-calendar"></i> Duration: ${group.duration} months</p>
                </div>
                <div class="group-actions" style="margin-top: 25px;">
                    <button class="btn btn-secondary" onclick="Groups.viewMembers('${group.id}')">View Members</button>
                </div>
            `;
            container.appendChild(card);
        });
    },

    async delete(id) {
        if (confirm('Are you sure you want to delete this group?')) {
            await Store.deleteGroup(id);
            await this.render();
            UI.showToast('Group deleted', 'warning');
            await this.updateDropdowns();
        }
    },

    viewMembers(groupId) {
        UI.switchSection('members');
    },

    async updateDropdowns() {
        const groups = await Store.getGroups();
        const dropdowns = [
            document.getElementById('member-group-select'),
            document.getElementById('draw-group-select'),
            document.getElementById('collection-group-filter')
        ];

        dropdowns.forEach(dropdown => {
            if (!dropdown) return;
            const isFilter = dropdown.id.includes('filter');
            dropdown.innerHTML = isFilter ? '<option value="all">All Groups</option>' : '<option value="">Select Group</option>';
            
            groups.forEach(g => {
                dropdown.innerHTML += `<option value="${g.id}">${g.name}</option>`;
            });
        });
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const addGroupBtn = document.getElementById('add-group-btn');
    const groupForm = document.getElementById('group-form');

    if (addGroupBtn) {
        addGroupBtn.addEventListener('click', () => {
            UI.showModal('group-modal');
        });
    }

    if (groupForm) {
        groupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const groupData = {
                name: document.getElementById('group-name').value,
                contribution: document.getElementById('group-contribution').value,
                duration: document.getElementById('group-duration').value
            };

            await Store.addGroup(groupData);
            UI.closeModal();
            groupForm.reset();
            await Groups.render();
            await Groups.updateDropdowns();
            UI.showToast('Group created successfully!');
        });
    }
});

window.Groups = Groups;
