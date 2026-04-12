import { Component, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-user-register',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './user-register.component.html',
  styleUrl: './user-register.component.scss'
})
export class UserRegisterComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private authService = inject(AuthService);

  // ── Parallax strings bound to the template ──
  bgTransform   = 'translate(0%, 0%)';
  cardTransform = 'translate(0%, 0%)';

  private _motionHandler = (e: DeviceOrientationEvent) => this._onDeviceMotion(e);

  fullName = signal('');
  email = signal('');
  password = signal('');
  confirmPassword = signal('');
  showPassword = signal(false);
  showConfirmPassword = signal(false);
  isLoading = signal(false);

  ngOnInit(): void {
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      (DeviceOrientationEvent as any).requestPermission()
        .then((state: string) => {
          if (state === 'granted') {
            window.addEventListener('deviceorientation', this._motionHandler);
          }
        }).catch(() => {});
    } else {
      window.addEventListener('deviceorientation', this._motionHandler);
    }
  }

  ngOnDestroy(): void {
    window.removeEventListener('deviceorientation', this._motionHandler);
  }

  private _onDeviceMotion(e: DeviceOrientationEvent): void {
    const maxTilt = 20;
    const intensity = 1.2;
    const gamma = Math.max(-maxTilt, Math.min(maxTilt, e.gamma ?? 0));
    const beta  = Math.max(-maxTilt, Math.min(maxTilt, e.beta  ?? 0));
    const x = (gamma / maxTilt) * intensity;
    const y = (beta  / maxTilt) * intensity;
    this.bgTransform   = `translate(${x}%, ${y}%)`;
    this.cardTransform = `translate(${-x * 0.4}%, ${-y * 0.4}%)`;
  }

  togglePasswordVisibility() {
    this.showPassword.update((v) => !v);
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword.update((v) => !v);
  }

  handleRegister() {
    if (!this.fullName() || !this.email() || !this.password()) return;
    
    this.isLoading.set(true);
    
    // Mock registration using persistent AuthService
    setTimeout(() => {
      this.authService.register({
        name: this.fullName(),
        email: this.email(),
        password: this.password(),
        role: 'Student'
      });
      
      this.isLoading.set(false);
      this.router.navigate(['/verify-otp']);
    }, 1200);
  }
}
