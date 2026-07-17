const { db } = require('../config/firebase');

/**
 * 컬렉션 단위 공통 CRUD 헬퍼
 * goals, todos, crews, characters, users 등에서 재사용
 */
class FirestoreService {
  constructor(collectionName) {
    this.collectionName = collectionName;
  }

  // 실제로 DB에 접근하는 시점에만 확인 → 파이어베이스 연결 전에도 서버는 정상적으로 켜짐
  get collection() {
    if (!db) {
      throw new Error(
        `Firebase가 아직 연결되지 않았습니다. (${this.collectionName} 컬렉션 접근 시도) ` +
        `serviceAccountKey.json 설정 후 다시 시도하세요.`
      );
    }
    return db.collection(this.collectionName);
  }

  // Firestore 문서 ID를 직접 지정해서 생성 (users/{uid} 처럼 uid를 문서 ID로 쓸 때)
  async createWithId(id, data) {
    await this.collection.doc(id).set({
      ...data,
      createdAt: new Date().toISOString(),
    });
    return { id, ...data };
  }

  async create(data) {
    const docRef = await this.collection.add({
      ...data,
      createdAt: new Date().toISOString(),
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
      updatedAt: new Date().toISOString(),
    });
    return this.getById(id);
  }

  async delete(id) {
    await this.collection.doc(id).delete();
    return { id };
  }
}

module.exports = FirestoreService;