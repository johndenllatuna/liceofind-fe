import { Component, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-verify-otp',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-verify-otp.html',
  styleUrl: './user-verify-otp.scss'
})
export class UserVerifyOtpComponent implements OnInit, OnDestroy {
  private router = inject(Router);

  // ── Parallax strings bound to the template ──
  bgTransform   = 'translate(0%, 0%)';
  cardTransform = 'translate(0%, 0%)';

  private _motionHandler = (e: DeviceOrientationEvent) => this._onDeviceMotion(e);


  code = signal('');
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

  handleConfirm() {
    this.isLoading.set(true);
    setTimeout(() => {
      this.isLoading.set(false);
      this.router.navigate(['/']); // Route to default login path
    }, 1000);
  }

  resendCode(e: Event) {
    e.preventDefault();
    // Simulate resend functionality placeholder
  }
}
