const { db, FieldValue } = require('../config/firebase');

/**
 * 컬렉션 단위 공통 CRUD 헬퍼
 */
class FirestoreService {
  constructor(collectionName) {
    this.collectionName = collectionName;
  }

  get collection() {
    if (!db) {
      throw new Error(
        `Firebase가 아직 연결되지 않았습니다. (${this.collectionName} 컬렉션 접근 시도) ` +
        `serviceAccountKey.json 설정 후 다시 시도하세요.`
      );
    }
    return db.collection(this.collectionName);
  }

  async createWithId(id, data) {
    await this.collection.doc(id).set({
      ...data,
      createdAt: FieldValue.serverTimestamp(),
    });
    return { id, ...data };
  }

  async create(data) {
    const docRef = await this.collection.add({
      ...data,
      createdAt: FieldValue.serverTimestamp(),
    });
    return { id: docRef.id, ...data };
  }

  async getById(id) {
    const doc = await this.collection.doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  }

  async getAllByField(field, value) {
    const snapshot = await this.collection.where(field, '==', value).get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }

  async update(id, data) {
    await this.collection.doc(id).update({
      ...data,
      updatedAt: FieldValue.serverTimestamp(),
    });
    return this.getById(id);
  }

  async delete(id) {
    await this.collection.doc(id).delete();
    return { id };
  }
}

module.exports = FirestoreService;