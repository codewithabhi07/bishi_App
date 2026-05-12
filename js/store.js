import { db, auth } from './firebase-config.js';
import { 
    collection, 
    addDoc, 
    getDocs, 
    doc, 
    setDoc, 
    deleteDoc, 
    updateDoc, 
    query, 
    where, 
    orderBy,
    limit,
    getDoc,
    Timestamp 
} from "firebase/firestore";

class Store {
    // Auth Sessions
    static async getCurrentUser() {
        const user = localStorage.getItem('currentUser');
        return user ? JSON.parse(user) : null;
    }

    static async setCurrentUser(user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
    }

    static logout() {
        localStorage.removeItem('currentUser');
    }

    // Groups
    static async getGroups() {
        const querySnapshot = await getDocs(collection(db, "groups"));
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }

    static async addGroup(group) {
        group.createdAt = Timestamp.now();
        const docRef = await addDoc(collection(db, "groups"), group);
        await this.addAuditLog(`Created group: ${group.name}`);
        return { id: docRef.id, ...group };
    }

    static async deleteGroup(id) {
        await deleteDoc(doc(db, "groups", id));
        // Note: In Firestore, you might want to delete members in a separate loop or Cloud Function
    }

    // Members
    static async getMembers() {
        const querySnapshot = await getDocs(collection(db, "members"));
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }

    static async addMember(member) {
        member.joinedAt = Timestamp.now();
        member.winCount = 0;
        const docRef = await addDoc(collection(db, "members"), member);
        return { id: docRef.id, ...member };
    }

    static async deleteMember(id) {
        await deleteDoc(doc(db, "members", id));
    }

    // Transactions
    static async getTransactions() {
        const q = query(collection(db, "transactions"), orderBy("date", "desc"));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), date: doc.data().date.toDate().toISOString() }));
    }

    static async addTransaction(transaction) {
        transaction.date = Timestamp.now();
        const docRef = await addDoc(collection(db, "transactions"), transaction);
        await this.addAuditLog(`Transaction: ${transaction.type} for ${transaction.memberName}`);
        return { id: docRef.id, ...transaction };
    }

    static async getMemberTotalPaid(memberId, month) {
        const q = query(collection(db, "transactions"), 
            where("memberId", "==", memberId),
            where("month", "==", month),
            where("type", "==", "Payment")
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.reduce((sum, doc) => sum + parseFloat(doc.data().amount), 0);
    }

    // Draw History
    static async getDrawHistory() {
        const q = query(collection(db, "drawHistory"), orderBy("timestamp", "desc"));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), timestamp: doc.data().timestamp.toDate().toISOString() }));
    }

    static async addDrawRecord(record) {
        record.timestamp = Timestamp.now();
        const docRef = await addDoc(collection(db, "drawHistory"), record);
        return { id: docRef.id, ...record };
    }

    // Audit Logs
    static async getAuditLogs() {
        const q = query(collection(db, "auditLogs"), orderBy("timestamp", "desc"), limit(100));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }

    static async addAuditLog(action) {
        const user = await this.getCurrentUser();
        await addDoc(collection(db, "auditLogs"), {
            action,
            timestamp: Timestamp.now(),
            user: user ? user.name : 'System'
        });
    }
}

// Export for use in other modules
window.Store = Store;
