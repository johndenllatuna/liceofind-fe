import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { ClaimService } from '../../services/claim.service';
import { AuthService } from '../../services/auth.service';

export interface Claim {
  id: number | string;
  itemName: string;
  dateClaimed: string;
  status: 'Pending' | 'Verified' | 'Rejected' | 'pending' | 'verified' | 'rejected';
}

@Component({
  selector: 'app-my-claims',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './my-claims.html',
  styleUrls: ['./my-claims.scss']
})
export class MyClaims implements OnInit, OnDestroy {
  private claimService = inject(ClaimService);
  private authService = inject(AuthService);
  private claimSub: Subscription | null = null;

  myClaims: Claim[] = [];
  currentUser = this.authService.getCurrentUser();

  ngOnInit() {
    if (this.currentUser && this.currentUser.email) {
      this.claimSub = this.claimService.getClaims().subscribe(allClaims => {
        this.myClaims = allClaims
          .filter(c => c.claimantEmail === this.currentUser!.email)
          .map(c => ({
            id: c.id,
            itemName: c.itemName,
            dateClaimed: c.claimDate,
            status: this.capitalize(c.status) as any
          }));
      });
    }
  }

  ngOnDestroy() {
    if (this.claimSub) {
      this.claimSub.unsubscribe();
    }
  }

  private capitalize(s: string): string {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }
}
