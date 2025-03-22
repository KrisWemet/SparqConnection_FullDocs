import { db } from '../config/firebase';
import bcrypt from 'bcryptjs';
export class UserService {
    constructor() {
        this.collection = db.collection('users');
    }
    async createUser(userData) {
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        const now = new Date();
        const userDoc = await this.collection.add({
            ...userData,
            password: hashedPassword,
            createdAt: now,
            updatedAt: now
        });
        return {
            id: userDoc.id,
            ...userData,
            password: hashedPassword,
            createdAt: now,
            updatedAt: now
        };
    }
    async findByEmail(email) {
        const snapshot = await this.collection.where('email', '==', email).get();
        if (snapshot.empty)
            return null;
        const doc = snapshot.docs[0];
        return { id: doc.id, ...doc.data() };
    }
    async findById(id) {
        const doc = await this.collection.doc(id).get();
        if (!doc.exists)
            return null;
        return { id: doc.id, ...doc.data() };
    }
    async updateUser(id, update) {
        await this.collection.doc(id).update({
            ...update,
            updatedAt: new Date()
        });
    }
    async comparePassword(user, candidatePassword) {
        return bcrypt.compare(candidatePassword, user.password);
    }
    async deleteUser(id) {
        await this.collection.doc(id).delete();
    }
}
export const userService = new UserService();
