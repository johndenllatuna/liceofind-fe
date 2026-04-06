import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router'; 
import { Router, RouterModule } from '@angular/router'; // 1. Import this
import { Auth } from '../../services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterModule], // <-- Make sure both are here!
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})

export class Sidebar {
  // 1. New flag to control the modal visibility
  showLogoutModal: boolean = false;

  constructor(private authService: Auth, private router: Router) {}

  // 2. Instead of a browser confirm, just show our custom modal
  onSignOut(event: Event) {
    event.preventDefault(); 
    this.showLogoutModal = true; 
  }

  // 3. If they click Cancel, just hide the modal
  cancelLogout() {
    this.showLogoutModal = false;
  }

  // 4. If they click Sign Out inside the modal, run the actual logout logic
  confirmLogout() {
    this.showLogoutModal = false;
    this.authService.logout();
        this.router.navigate(['/']); 
  }
}