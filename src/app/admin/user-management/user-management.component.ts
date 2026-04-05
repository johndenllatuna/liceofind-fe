import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Sidebar } from '../../shared/sidebar/sidebar.component';
import { UserService, User } from '../../services/user.service';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule, Sidebar],
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss']
})
export class UserManagement implements OnInit {
  private userService = inject(UserService);

  allUsers: User[] = [];
  filteredUsers: User[] = [];
  
  // Filter states
  searchTerm: string = '';
  selectedRole: string = 'All Roles';

  ngOnInit() {
    this.allUsers = this.userService.getUsers();
    this.applyFilters();
  }

  applyFilters() {
    this.filteredUsers = this.allUsers.filter(user => {
      // 1. Check Search Term
      const matchesSearch = user.name.toLowerCase().includes(this.searchTerm.toLowerCase()) || 
                            user.email.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      // 2. Check Role Dropdown
      const matchesRole = this.selectedRole === 'All Roles' || user.role === this.selectedRole;

      return matchesSearch && matchesRole;
    });
  }

  toggleStatus(user: User) {
    // In a real app, you might want a confirmation popup here first!
    this.userService.toggleUserStatus(user.id);
    this.applyFilters(); // Refresh the list
  }

  isDropdownOpen: boolean = false;
roles: string[] = ['All Roles', 'Student', 'Admin'];


// Add these methods to handle the custom dropdown
toggleDropdown() {
  this.isDropdownOpen = !this.isDropdownOpen;
}

selectRole(role: string) {
  this.selectedRole = role;
  this.isDropdownOpen = false; // Close menu after selecting
  this.applyFilters();
}

showConfirmModal: boolean = false;
userToModify: any = null;

// --- NEW METHODS FOR MODAL ---
  openConfirmModal(user: any) {
    this.userToModify = user;
    this.showConfirmModal = true;
  }

  closeModal() {
    this.showConfirmModal = false;
    this.userToModify = null;
  }

  confirmAction() {
    if (this.userToModify) {
      // Toggle the user's status 
      // (You will eventually call your backend service here)
      this.userToModify.isActive = !this.userToModify.isActive;
    }
    this.closeModal(); // Close the modal after confirming
  }
}