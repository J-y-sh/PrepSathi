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
  UpdateData,
} from "firebase/firestore";

import { db } from "@/firebase/firebase";

export class BaseService<T extends DocumentData = DocumentData> {
  protected collectionName: string;

  constructor(collectionName: string) {
    this.collectionName = collectionName;
  }

  // =========================================================
  // CREATE
  // =========================================================

  async create(
    id: string,
    data: WithFieldValue<Omit<T, "id">>
  ): Promise<void> {
    const docRef = doc(
      db,
      this.collectionName,
      id
    );

    await setDoc(docRef, data);
  }

  // =========================================================
  // GET
  // =========================================================

  async get(
    id: string
  ): Promise<T | null> {
    const docRef = doc(
      db,
      this.collectionName,
      id
    );

    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    return {
      id: docSnap.id,
      ...docSnap.data(),
    } as unknown as T;
  }

  // =========================================================
  // UPDATE
  // =========================================================

  async update(
    id: string,
    data: UpdateData<T>
  ): Promise<void> {
    const docRef = doc(
      db,
      this.collectionName,
      id
    );

    await updateDoc(docRef, data);
  }

  // =========================================================
  // DELETE
  // =========================================================

  async delete(
    id: string
  ): Promise<void> {
    const docRef = doc(
      db,
      this.collectionName,
      id
    );

    await deleteDoc(docRef);
  }

  // =========================================================
  // LIST
  // =========================================================

  async list(
    constraints: QueryConstraint[] = []
  ): Promise<T[]> {
    try {
      console.log(
        "Running Firestore query..."
      );

      const colRef = collection(
        db,
        this.collectionName
      );

      const q = query(
        colRef,
        ...constraints
      );

      const querySnapshot =
        await getDocs(q);

      console.log(
        "Documents found:",
        querySnapshot.size
      );

      const result =
        querySnapshot.docs.map(
          (document) =>
            ({
              id: document.id,
              ...document.data(),
            } as unknown as T)
        );

      console.log(
        "Result:",
        result
      );

      return result;
    } catch (error) {
      console.error(
        "Firestore query failed:",
        error
      );

      throw error;
    }
  }
}