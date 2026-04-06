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

    // 1. Trigger the browser's built-in confirmation popup
    const wantsToSignOut = window.confirm('Do you want to sign out?');

    // 2. Only log them out IF they clicked "OK"
    if (wantsToSignOut) {
      this.authService.logout(); 
      this.router.navigate(['/admin-login']); 
    }
  }
 }