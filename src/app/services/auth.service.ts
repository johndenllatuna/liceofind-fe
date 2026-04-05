import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class Auth {
  // 1. Change from single variables to an array of admin objects
  private readonly ADMIN_ACCOUNTS = [
    { email: 'jllatuna30115@liceo.edu.ph', password: '20221330115' },
  ];

  constructor() {}

  login(email: string, pass: string): boolean {
    // 2. Check if ANY account in our array matches the typed email AND password
    const userExists = this.ADMIN_ACCOUNTS.some(
      admin => admin.email === email && admin.password === pass
    );

    if (userExists) {
      localStorage.setItem('isAdminLoggedIn', 'true');
      return true;
    }
    return false;
  }

  logout(): void {
    localStorage.removeItem('isAdminLoggedIn');
  }

  isLoggedIn(): boolean {
    return localStorage.getItem('isAdminLoggedIn') === 'true';
  }
}