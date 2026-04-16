import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of, map } from 'rxjs';
import { Router } from '@angular/router';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Student' | 'Admin';
  isActive?: boolean;
  is_active?: boolean;
  password?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private API_URL = 'http://localhost:3000/api/auth';
  private USER_API_URL = 'http://localhost:3000/api/users';
  private STORAGE_KEY = 'ldcufind_token';
  private SESSION_KEY = 'ldcufind_current_user';

  // Stateful signal for the current session
  currentUser = signal<User | null>(this.loadSession());

  constructor() {}

  private loadSession(): User | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      const session = localStorage.getItem(this.SESSION_KEY);
      return session ? JSON.parse(session) : null;
    }
    return null;
  }

  getToken(): string | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem(this.STORAGE_KEY);
    }
    return null;
  }

  login(email: string, password: string, role: string = 'Student'): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/login`, { email, password, role }).pipe(
      tap(response => {
        if (response.token) {
          localStorage.setItem(this.STORAGE_KEY, response.token);
          localStorage.setItem(this.SESSION_KEY, JSON.stringify(response.user));
          this.currentUser.set(response.user);
        }
      })
    );
  }

  register(userData: any): Observable<any> {
    return this.http.post(`${this.API_URL}/register`, userData);
  }

  requestPasswordReset(email: string): Observable<any> {
    return this.http.post(`${this.API_URL}/forgot-password`, { email });
  }

  verifyOtp(data: any): Observable<any> {
    return this.http.post(`${this.API_URL}/verify-otp`, data);
  }

  logout(isAdmin: boolean = false) {
    this.currentUser.set(null);
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(this.STORAGE_KEY);
      localStorage.removeItem(this.SESSION_KEY);
    }

    if (isAdmin) {
      this.router.navigate(['/admin-login']);
    } else {
      this.router.navigate(['/']);
    }
  }

  getCurrentUser(): User {
    return this.currentUser() || {
      id: '',
      name: 'Guest',
      email: '',
      role: 'Student',
      isActive: false
    };
  }

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.USER_API_URL);
  }

  toggleUserStatus(userId: string): Observable<any> {
    return this.http.patch(`${this.USER_API_URL}/${userId}/status`, {});
  }

  updateProfile(userId: string, data: any): Observable<any> {
    return this.http.patch(`${this.USER_API_URL}/${userId}`, data).pipe(
      tap((response: any) => {
        if (response.user) {
          localStorage.setItem(this.SESSION_KEY, JSON.stringify(response.user));
          this.currentUser.set(response.user);
        }
      })
    );
  }
}