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

  fullNameStr = '';
  emailStr = '';
  passwordStr = '';
  confirmPasswordStr = '';
  
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
    console.log('handleRegister called with:', { name: this.fullNameStr, email: this.emailStr });
    
    if (!this.fullNameStr || !this.emailStr || !this.passwordStr || !this.confirmPasswordStr) {
      console.warn('Registration form is incomplete');
      return;
    }

    if (this.passwordStr !== this.confirmPasswordStr) {
      alert('Passwords do not match');
      return;
    }
    
    this.isLoading.set(true);
    
    this.authService.register({
      name: this.fullNameStr,
      email: this.emailStr,
      password: this.passwordStr
    }).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        // Pass data to verify-otp page
        this.router.navigate(['/verify-otp'], { 
          state: { 
            name: this.fullNameStr, 
            email: this.emailStr, 
            password: this.passwordStr 
          } 
        });
      },
      error: (err) => {
        this.isLoading.set(false);
        console.error('Registration failed:', err);
        // Add toast or alert here if needed
      }
    });
  }
}
