import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, Auth } from 'firebase/auth';
import { getFirestore, collection, addDoc, Firestore } from 'firebase/firestore';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth: Auth;
  private db: Firestore;
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor() {
    const app = initializeApp(environment.firebase);
    this.auth = getAuth(app);
    this.db = getFirestore(app);
  }

  async signUpWithEmail(email: string): Promise<void> {
    try {
      // Generate a random password for the user
      const password = Math.random().toString(36).slice(-8);
      
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      
      // Store user email in Firestore
      await addDoc(collection(this.db, 'users'), {
        email: email,
        createdAt: new Date()
      });

      this.isAuthenticatedSubject.next(true);
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        // If user exists, try to sign in
        await this.signInWithEmail(email);
      } else {
        throw error;
      }
    }
  }

  private async signInWithEmail(email: string): Promise<void> {
    try {
      // Use the same password generation logic for existing users
      const password = Math.random().toString(36).slice(-8);
      await signInWithEmailAndPassword(this.auth, email, password);
      this.isAuthenticatedSubject.next(true);
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
} 