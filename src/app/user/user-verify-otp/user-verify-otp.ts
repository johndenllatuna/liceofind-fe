import { Component, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-user-verify-otp',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-verify-otp.html',
  styleUrl: './user-verify-otp.scss'
})
export class UserVerifyOtpComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private authService = inject(AuthService);
  
  registrationData: any = null;

  // ── Parallax strings bound to the template ──
  bgTransform   = 'translate(0%, 0%)';
  cardTransform = 'translate(0%, 0%)';

  private _motionHandler = (e: DeviceOrientationEvent) => this._onDeviceMotion(e);


  codeStr = '';
  isLoading = signal(false);
  isResending = signal(false);

  showToast = signal(false);
  errorMessage = signal('');

  countdown = signal(180);
  timerInterval: any;

  get formattedTime() {
    const totalSeconds = this.countdown();
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  ngOnInit(): void {
    const navigation = this.router.getCurrentNavigation();
    if (history.state && history.state.email) {
      this.registrationData = history.state;
    } else {
      // If no data, redirect back to register
      this.router.navigate(['/user/register']);
    }

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
    this.startTimer();
  }

  ngOnDestroy(): void {
    window.removeEventListener('deviceorientation', this._motionHandler);
    this.stopTimer();
  }

  startTimer() {
    this.countdown.set(180);
    this.timerInterval = setInterval(() => {
      const current = this.countdown();
      if (current > 0) {
        this.countdown.set(current - 1);
      } else {
        this.stopTimer();
        this.triggerToast('Your OTP code has expired. Please request a new one.');
      }
    }, 1000);
  }

  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  private triggerToast(message: string) {
    this.errorMessage.set(message);
    this.showToast.set(true);
    setTimeout(() => {
      this.showToast.set(false);
    }, 4000);
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

  handleConfirm() {
    if (!this.codeStr || !this.registrationData || this.countdown() === 0) return;

    this.isLoading.set(true);
    
    this.authService.verifyOtp({
      ...this.registrationData,
      code: this.codeStr
    }).pipe(
      // Optional: hide loading on complete/error
    ).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        this.router.navigate(['/']); // Redirect to login
      },
      error: (err) => {
        this.isLoading.set(false);
        console.error('OTP verification failed:', err);
        // Show error message to user
      }
    });
  }

  resendCode(e: Event) {
    e.preventDefault();
    if (!this.registrationData || !this.registrationData.email) return;

    this.isResending.set(true);

    // Assume resendOtp exists in authService as requested
    (this.authService as any).resendOtp(this.registrationData.email).subscribe({
      next: () => {
        this.isResending.set(false);
        this.codeStr = '';
        this.startTimer();
        this.triggerToast('A new 6-digit code has been sent to your email.');
      },
      error: (err: any) => {
        this.isResending.set(false);
        this.triggerToast('Failed to resend code. Please try again.');
        console.error('Failed to resend code:', err);
      }
    });
  }
}
