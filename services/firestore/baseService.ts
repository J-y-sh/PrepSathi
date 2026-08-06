import {
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  QueryConstraint,
  DocumentData,
  WithFieldValue,
  UpdateData
} from "firebase/firestore";
import { db } from "@/firebase/firebase";

export class BaseService<T extends DocumentData> {
  protected collectionName: string;

  constructor(collectionName: string) {
    this.collectionName = collectionName;
  }

  async create(id: string, data: WithFieldValue<T>): Promise<void> {
    const docRef = doc(db, this.collectionName, id);
    await setDoc(docRef, data);
  }

  async get(id: string): Promise<T | null> {
    const docRef = doc(db, this.collectionName, id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? (docSnap.data() as T) : null;
  }

  async update(id: string, data: UpdateData<T>): Promise<void> {
    const docRef = doc(db, this.collectionName, id);
    await updateDoc(docRef, data);
  }

  async delete(id: string): Promise<void> {
    const docRef = doc(db, this.collectionName, id);
    await deleteDoc(docRef);
  }

  async list(constraints: QueryConstraint[] = []): Promise<T[]> {
    const colRef = collection(db, this.collectionName);
    const q = query(colRef, ...constraints);
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
  }
}
