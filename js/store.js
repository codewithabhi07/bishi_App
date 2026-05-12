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
        const localUser = localStorage.getItem('currentUser');
        if (localUser) return JSON.parse(localUser);
        
        // Fallback to actual Firebase Auth state
        const firebaseUser = auth.currentUser;
        if (firebaseUser) {
            return {
                name: firebaseUser.displayName || 'User',
                email: firebaseUser.email,
                uid: firebaseUser.uid
            };
        }
        return null;
    }

    static async setCurrentUser(user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
    }

    static logout() {
        localStorage.removeItem('currentUser');
    }

    // Groups
    static async getGroups() {
        try {
            const querySnapshot = await getDocs(collection(db, "groups"));
            return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error("Firestore Error (getGroups):", error);
            if (error.code === 'permission-denied') {
                UI.showToast('Firestore access denied. Please check security rules.', 'error');
            }
            return [];
        }
    }

    static async addGroup(group) {
        try {
            group.createdAt = Timestamp.now();
            const docRef = await addDoc(collection(db, "groups"), group);
            await this.addAuditLog(`Created group: ${group.name}`);
            return { id: docRef.id, ...group };
        } catch (error) {
            console.error("Firestore Error (addGroup):", error);
            UI.showToast('Failed to save group. Check permissions.', 'error');
            throw error;
        }
    }

    static async deleteGroup(id) {
        try {
            await deleteDoc(doc(db, "groups", id));
        } catch (error) {
            console.error("Firestore Error (deleteGroup):", error);
            UI.showToast('Failed to delete group.', 'error');
        }
    }

    // Members
    static async getMembers() {
        try {
            const querySnapshot = await getDocs(collection(db, "members"));
            return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error("Firestore Error (getMembers):", error);
            return [];
        }
    }

    static async addMember(member) {
        try {
            member.joinedAt = Timestamp.now();
            member.winCount = 0;
            const docRef = await addDoc(collection(db, "members"), member);
            return { id: docRef.id, ...member };
        } catch (error) {
            console.error("Firestore Error (addMember):", error);
            UI.showToast('Failed to add member.', 'error');
            throw error;
        }
    }

    static async deleteMember(id) {
        try {
            await deleteDoc(doc(db, "members", id));
        } catch (error) {
            console.error("Firestore Error (deleteMember):", error);
            UI.showToast('Failed to remove member.', 'error');
        }
    }

    // Transactions
    static async getTransactions() {
        try {
            const q = query(collection(db, "transactions"), orderBy("date", "desc"));
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), date: doc.data().date.toDate().toISOString() }));
        } catch (error) {
            console.error("Firestore Error (getTransactions):", error);
            return [];
        }
    }

    static async addTransaction(transaction) {
        try {
            transaction.date = Timestamp.now();
            const docRef = await addDoc(collection(db, "transactions"), transaction);
            await this.addAuditLog(`Transaction: ${transaction.type} for ${transaction.memberName}`);
            return { id: docRef.id, ...transaction };
        } catch (error) {
            console.error("Firestore Error (addTransaction):", error);
            UI.showToast('Failed to record transaction.', 'error');
            throw error;
        }
    }

    static async getMemberTotalPaid(memberId, month) {
        try {
            const q = query(collection(db, "transactions"), 
                where("memberId", "==", memberId),
                where("month", "==", month),
                where("type", "==", "Payment")
            );
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.reduce((sum, doc) => sum + parseFloat(doc.data().amount), 0);
        } catch (error) {
            console.error("Firestore Error (getMemberTotalPaid):", error);
            return 0;
        }
    }

    // Draw History
    static async getDrawHistory() {
        try {
            const q = query(collection(db, "drawHistory"), orderBy("timestamp", "desc"));
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), timestamp: doc.data().timestamp.toDate().toISOString() }));
        } catch (error) {
            console.error("Firestore Error (getDrawHistory):", error);
            return [];
        }
    }

    static async addDrawRecord(record) {
        try {
            record.timestamp = Timestamp.now();
            const docRef = await addDoc(collection(db, "drawHistory"), record);
            return { id: docRef.id, ...record };
        } catch (error) {
            console.error("Firestore Error (addDrawRecord):", error);
            UI.showToast('Failed to record draw.', 'error');
            throw error;
        }
    }

    // Audit Logs
    static async getAuditLogs() {
        try {
            const q = query(collection(db, "auditLogs"), orderBy("timestamp", "desc"), limit(100));
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error("Firestore Error (getAuditLogs):", error);
            return [];
        }
    }

    static async addAuditLog(action) {
        try {
            const user = await this.getCurrentUser();
            await addDoc(collection(db, "auditLogs"), {
                action,
                timestamp: Timestamp.now(),
                user: user ? user.name : 'System'
            });
        } catch (error) {
            console.warn("Audit log failed (likely permission issue):", error);
            // Don't throw here to avoid breaking the main operation
        }
    }
}

// Export for use in other modules
window.Store = Store;
