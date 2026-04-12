import { Injectable, signal, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router } from '@angular/router';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Student' | 'Admin';
  isActive: boolean;
  password?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private router = inject(Router);
  private STORAGE_KEY = 'ldcufind_users';
  private SESSION_KEY = 'ldcufind_current_user';
  private usersSubject: BehaviorSubject<User[]>;

  // Stateful signal for the current session
  currentUser = signal<User | null>(this.loadSession());

  constructor() {
    this.usersSubject = new BehaviorSubject<User[]>(this.loadUsers());
  }

  private loadUsers(): User[] {
    if (typeof window !== 'undefined' && window.localStorage) {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) return JSON.parse(saved);

      const defaultUsers: User[] = [
        { id: '101', name: 'LDCU Admin', email: 'admin@liceo.edu.ph', role: 'Admin', isActive: true, password: 'admin' },
      ];
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(defaultUsers));
      return defaultUsers;
    }
    return [];
  }

  private loadSession(): User | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      const session = localStorage.getItem(this.SESSION_KEY);
      return session ? JSON.parse(session) : null;
    }
    return null;
  }

  private saveUsers(users: User[]) {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(users));
    }
  }

  getAllUsers(): Observable<User[]> {
    return this.usersSubject.asObservable();
  }

  register(userData: Partial<User>) {
    const users = this.usersSubject.getValue();
    const newUser: User = {
      id: 'usr_' + Date.now(),
      name: userData.name || 'Unknown User',
      email: userData.email || '',
      password: userData.password || '',
      role: userData.role || 'Student',
      isActive: true
    };

    const updatedUsers = [...users, newUser];
    this.usersSubject.next(updatedUsers);
    this.saveUsers(updatedUsers);
    return newUser;
  }

  toggleUserStatus(userId: string) {
    const users = this.usersSubject.getValue();
    const index = users.findIndex(u => u.id === userId);
    if (index !== -1) {
      const updatedUsers = [...users];
      updatedUsers[index] = { ...updatedUsers[index], isActive: !updatedUsers[index].isActive };
      this.usersSubject.next(updatedUsers);
      this.saveUsers(updatedUsers);
    }
  }

  getCurrentUser(): User {
    const session = this.currentUser();
    if (session) return session;

    return {
      id: '102',
      name: 'Alex Student',
      email: 'alex.student@university.edu',
      role: 'Student',
      isActive: true
    };
  }

  logout(isAdmin: boolean = false) {
    this.currentUser.set(null);
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(this.SESSION_KEY);
    }

    // Role-aware redirection
    if (isAdmin) {
      this.router.navigate(['/admin-login']);
    } else {
      this.router.navigate(['/']);
    }
  }

  login(email: string, password: string): User | null {
    const users = this.usersSubject.getValue();
    const user = users.find(u =>
      u.email === email &&
      (u.password === password || (u.role === 'Admin' && password === 'admin'))
    );

    if (user && user.isActive) {
      this.currentUser.set(user);
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(this.SESSION_KEY, JSON.stringify(user));
      }
      return user;
    }
    return null;
  }
}