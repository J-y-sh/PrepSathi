import { serverTimestamp } from "firebase/firestore";
import { User } from "@/types/User";
import { BaseService } from "./baseService";
import { User as FirebaseUser } from "firebase/auth";

class UserService extends BaseService<User> {
  constructor() {
    super("users");
  }

  async syncUser(firebaseUser: FirebaseUser): Promise<void> {
    const existingUser = await this.get(firebaseUser.uid);

    if (!existingUser) {
      const newUser: User = {
        uid: firebaseUser.uid,
        name: firebaseUser.displayName,
        email: firebaseUser.email,
        photoURL: firebaseUser.photoURL,
        targetExam: "UPSC CSE 2028",
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        streak: 0,
        xp: 0,
        todayStudyHours: 0,
        theme: "dark",
      };
      await this.create(firebaseUser.uid, newUser);
    } else {
      await this.update(firebaseUser.uid, {
        lastLogin: serverTimestamp(),
      });
    }
  }
}

export const userService = new UserService();
