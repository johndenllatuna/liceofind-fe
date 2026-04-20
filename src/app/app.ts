import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SocketService } from './services/socket.service';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  protected readonly title = signal('liceofind-fe');

  private socketService = inject(SocketService);
  authService = inject(AuthService);
  private router = inject(Router);

  ngOnInit() {
    this.socketService.onEvent<{ userId: any }>('user-deactivated').subscribe(data => {
      const current = this.authService.getCurrentUser();
      if (current && Number(current.id) === Number(data.userId)) {
        // Show deactivation modal with "Log Out" button
        this.authService.deactivationModalMode.set('logout');
        this.authService.showDeactivationModal.set(true);
      }
    });
  }

  onDeactivationAction() {
    const mode = this.authService.deactivationModalMode();
    this.authService.showDeactivationModal.set(false);
    if (mode === 'logout') {
      this.authService.logout();
    }
    // 'continue' simply dismisses the modal (user stays on login page)
  }
}
