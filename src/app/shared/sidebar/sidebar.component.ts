import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router'; 
import { Router, RouterModule } from '@angular/router'; 
import { AuthService } from '../../services/auth.service';
import { ClaimService } from '../../services/claim.service'; // <-- Import your actual service here

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterModule], 
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class Sidebar implements OnInit {
  showLogoutModal: boolean = false;
  
  // Start at 0 so the badge stays hidden until the real data loads
  pendingClaimsCount: number = 0; 

  constructor(
    private authService: AuthService, 
    private router: Router,
    private claimService: ClaimService // <-- Inject it here
  ) {}

  ngOnInit() {
    this.claimService.getPendingClaimsCount().subscribe((count: number) => {
      this.pendingClaimsCount = count;
    });
  }

  onSignOut(event: Event) {
    event.preventDefault(); 
    this.showLogoutModal = true; 
  }

  cancelLogout() {
    this.showLogoutModal = false;
  }

  confirmLogout() {
    this.showLogoutModal = false;
    // Call role-aware logout (true for Admin)
    this.authService.logout(true);
  }
}