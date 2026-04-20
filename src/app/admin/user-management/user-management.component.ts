import { Component, inject, OnInit, AfterViewInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AuthService, User } from '../../services/auth.service';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss']
})
export class UserManagement implements OnInit, AfterViewInit {
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);
  private ngZone = inject(NgZone);

  // --- ANIMATION STATE ---
  pageEntered: boolean = false;

  allUsers: User[] = [];
  filteredUsers: User[] = [];

  // Loading state for modal
  isProcessingModal: boolean = false;

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

  isUserActive(user: any): boolean {
    if (!user) return false;
    return user.is_active !== undefined ? user.is_active : !!user.isActive;
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
    if (!this.userToModify) {
      this.closeModal();
      return;
    }

    this.isProcessingModal = true;

    this.authService.toggleUserStatus(this.userToModify.id).subscribe({
      next: () => {
        this.ngZone.run(() => {
          // Update local status
          const isActiveNow = this.userToModify.is_active !== undefined 
            ? this.userToModify.is_active 
            : this.userToModify.isActive;

          if (this.userToModify.is_active !== undefined) {
            this.userToModify.is_active = !isActiveNow;
          } else {
            this.userToModify.isActive = !isActiveNow;
          }
          
          // Reset state and close
          this.isProcessingModal = false;
          this.closeModal();
          this.cdr.detectChanges(); // Force view refresh
        });
      },
      error: (err) => {
        this.ngZone.run(() => {
          console.error('Error updating user status:', err);
          this.isProcessingModal = false;
          this.closeModal();
          this.cdr.detectChanges();
        });
      }
    });
  }
}