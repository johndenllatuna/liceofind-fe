import { Component, inject, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Sidebar } from '../../shared/sidebar/sidebar.component';
import { AuthService, User } from '../../services/auth.service';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule, Sidebar],
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss']
})
export class UserManagement implements OnInit, AfterViewInit {
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  // --- ANIMATION STATE ---
  pageEntered: boolean = false;

  allUsers: User[] = [];
  filteredUsers: User[] = [];
  
  // Filter states
  searchTerm: string = '';
  selectedRole: string = 'All Roles';

  ngOnInit() {
    this.authService.getAllUsers().subscribe(users => {
      this.allUsers = users;
      this.applyFilters();
    });
  }

  ngAfterViewInit() {
    // Trigger entrance animation cleanly
    setTimeout(() => {
      this.pageEntered = true;
      this.cdr.detectChanges(); // Force Angular to evaluate [class.is-entered] immediately
    }, 50);
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
    this.authService.toggleUserStatus(user.id);
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
      this.authService.toggleUserStatus(this.userToModify.id);
    }
    this.closeModal(); // Close the modal after confirming
  }
}