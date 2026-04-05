import { Injectable } from '@angular/core';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Student' | 'Admin';
  isActive: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  // Mock data based on your Figma
  private users: User[] = [
    { id: '1', name: 'Tristan Joules C. Pahayahay', email: 'tjpahayahay67260@liceo.edu.ph', role: 'Student', isActive: true },
    { id: '2', name: 'Johnden M. Llatuna', email: 'jllatuna30115@liceo.edu.ph', role: 'Student', isActive: true },
    { id: '3', name: 'Maria Santos', email: 'maria@liceo.edu.ph', role: 'Admin', isActive: true },
    // Add a few more here to test pagination later!
  ];

  getUsers(): User[] {
    return this.users;
  }

  toggleUserStatus(id: string): void {
    const user = this.users.find(u => u.id === id);
    if (user) {
      user.isActive = !user.isActive;
    }
  }
}