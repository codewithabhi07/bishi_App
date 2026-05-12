class Store {
    static get(key) {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : [];
    }

    static save(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    }

    // Auth
    static getUsers() { return this.get('users'); }
    static addUser(user) {
        const users = this.getUsers();
        users.push(user);
        this.save('users', users);
    }

    // Groups
    static getGroups() { return this.get('groups'); }
    static addGroup(group) {
        const groups = this.getGroups();
        group.id = Date.now().toString();
        group.createdAt = new Date().toISOString();
        groups.push(group);
        this.save('groups', groups);
        return group;
    }

    static deleteGroup(id) {
        let groups = this.getGroups();
        groups = groups.filter(g => g.id !== id);
        this.save('groups', groups);
        
        // Also delete members of this group
        let members = this.getMembers();
        members = members.filter(m => m.groupId !== id);
        this.save('members', members);
    }

    // Members
    static getMembers() { return this.get('members'); }
    static addMember(member) {
        const members = this.getMembers();
        member.id = Date.now().toString();
        member.joinedAt = new Date().toISOString();
        member.winCount = 0;
        members.push(member);
        this.save('members', members);
        return member;
    }

    static updateMember(id, updates) {
        const members = this.getMembers();
        const index = members.findIndex(m => m.id === id);
        if (index !== -1) {
            members[index] = { ...members[index], ...updates };
            this.save('members', members);
        }
    }

    static deleteMember(id) {
        let members = this.getMembers();
        members = members.filter(m => m.id !== id);
        this.save('members', members);
    }

    // Transactions / Collections
    static getTransactions() { return this.get('transactions'); }
    static addTransaction(transaction) {
        const transactions = this.getTransactions();
        transaction.id = Date.now().toString();
        transaction.date = new Date().toISOString();
        transactions.push(transaction);
        this.save('transactions', transactions);
        
        // Add to Audit Log
        this.addAuditLog(`Transaction: ${transaction.type} of $${transaction.amount} for ${transaction.memberName}`);
        return transaction;
    }

    static getMemberTotalPaid(memberId, month) {
        const transactions = this.getTransactions();
        return transactions
            .filter(t => t.memberId === memberId && t.month === month && t.type === 'Payment')
            .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    }

    // Audit Logs
    static getAuditLogs() { return this.get('auditLogs'); }
    static addAuditLog(action) {
        const logs = this.getAuditLogs();
        logs.unshift({
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            action,
            user: this.getCurrentUser() ? this.getCurrentUser().name : 'System'
        });
        this.save('auditLogs', logs.slice(0, 100)); // Keep last 100 logs
    }

    // Archiving
    static archiveGroup(groupId) {
        const groups = this.getGroups();
        const index = groups.findIndex(g => g.id === groupId);
        if (index !== -1) {
            groups[index].status = 'archived';
            groups[index].archivedAt = new Date().toISOString();
            this.save('groups', groups);
            this.addAuditLog(`Archived group: ${groups[index].name}`);
        }
    }

    // Draw History
    static getDrawHistory() { return this.get('drawHistory'); }
    static addDrawRecord(record) {
        const history = this.getDrawHistory();
        record.id = Date.now().toString();
        record.timestamp = new Date().toISOString();
        history.unshift(record);
        this.save('drawHistory', history);
        return record;
    }

    // User Session (Temporary)
    static getCurrentUser() {
        const user = localStorage.getItem('currentUser');
        return user ? JSON.parse(user) : null;
    }

    static setCurrentUser(user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
    }

    static logout() {
        localStorage.removeItem('currentUser');
    }
}
