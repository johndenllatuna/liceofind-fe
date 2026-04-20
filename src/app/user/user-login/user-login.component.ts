import { Component, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-user-login',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './user-login.component.html',
  styleUrls: ['./user-login.component.scss'],
})
export class UserLogin implements OnInit, OnDestroy {
  private router = inject(Router);
  private authService = inject(AuthService);

  // ── Parallax strings bound to the template ──
  bgTransform = 'translate(0%, 0%)';
  cardTransform = 'translate(0%, 0%)';

  private _motionHandler = (e: DeviceOrientationEvent) => this._onDeviceMotion(e);

  emailStr = '';
  passwordStr = '';
  showPassword = signal(false);
  isLoading = signal(false);

  // Toast notification state
  showToast = signal(false);

  ngOnInit(): void {
    // Request permission on iOS 13+ and attach device-orientation parallax
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      // iOS — permission must be triggered by user gesture; best-effort here
      (DeviceOrientationEvent as any).requestPermission()
        .then((state: string) => {
          if (state === 'granted') {
            window.addEventListener('deviceorientation', this._motionHandler);
          }
        }).catch(() => { });
    } else {
      window.addEventListener('deviceorientation', this._motionHandler);
    }
  }

  ngOnDestroy(): void {
    window.removeEventListener('deviceorientation', this._motionHandler);
  }

  /** Gyroscope tilt → subtle background/card counter-moves */
  private _onDeviceMotion(e: DeviceOrientationEvent): void {
    const maxTilt = 20;   // degrees clamped
    const intensity = 1.2; // max % translate
    const gamma = Math.max(-maxTilt, Math.min(maxTilt, e.gamma ?? 0)); // left/right
    const beta = Math.max(-maxTilt, Math.min(maxTilt, e.beta ?? 0)); // front/back
    const x = (gamma / maxTilt) * intensity;
    const y = (beta / maxTilt) * intensity;
    // Background moves with tilt; card counter-moves for depth
    this.bgTransform = `translate(${x}%, ${y}%)`;
    this.cardTransform = `translate(${-x * 0.4}%, ${-y * 0.4}%)`;
  }

  togglePasswordVisibility() {
    this.showPassword.update((v) => !v);
  }

  handleLogin() {
    if (!this.emailStr || !this.passwordStr) {
      this.triggerToast('Please enter your email and password.');
      return;
    }

    this.isLoading.set(true);

    this.authService.login(this.emailStr, this.passwordStr).subscribe({
      next: (user) => {
        this.isLoading.set(false);
        if (user && user.role === 'Admin') {
          this.router.navigate(['/admin-dashboard']);
        } else if (user) {
          this.router.navigate(['/user/home']);
        }
      },
      error: (err) => {
        this.isLoading.set(false);

        // 403 = account deactivated — show the global deactivation modal
        if (err.status === 403) {
          this.authService.deactivationModalMode.set('continue');
          this.authService.showDeactivationModal.set(true);
        } else {
          this.triggerToast('Invalid email or password.');
        }
        console.error('Login failed:', err);
      }
    });
  }

  private triggerToast(message?: string) {
    this.showToast.set(true);
    // Auto-dismiss after 4 seconds
    setTimeout(() => {
      this.showToast.set(false);
    }, 4000);
  }
}
