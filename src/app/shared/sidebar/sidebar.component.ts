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
  constructor(private authService: Auth, private router: Router) {}

  onSignOut(event: Event) {
    event.preventDefault(); // Stop the <a> tag from refreshing the page
    this.authService.logout(); // Clears the localStorage flag
    this.router.navigate(['/admin-login']); // Send them back to the start
  }
 }