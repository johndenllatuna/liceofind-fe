import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs'; // 👈 ADDED: Import RxJS utilities

export interface Claim {
  id: string;
  itemName: string;
  itemImageUrl: string;
  claimantName: string;
  claimDate: string;
  status: 'pending' | 'verified' | 'rejected';
  proofText: string; 
}

@Injectable({
  providedIn: 'root'
})
export class ClaimService {
  
  // Mock data updated to include proofText
  private mockClaims: Claim[] = [
    {
      id: 'C-1001',
      itemName: 'Toyota Car Keys',
      itemImageUrl: 'assets/images/keys.jpg', 
      claimantName: 'John Doe',
      claimDate: '2026-04-01',
      status: 'pending',
      proofText: 'I left my keys in the library on the 3rd floor near the engineering section.'
    },
    {
      id: 'C-1002',
      itemName: 'AquaFlask Tumbler',
      itemImageUrl: 'assets/images/tumbler.jpg',
      claimantName: 'Maria Santos',
      claimDate: '2026-04-02',
      status: 'verified',
      proofText: 'These AirPods were purchased by me. The device is associated with my personal Apple ID, and I can provide identifying details such as the serial number.'
    },
    {
      id: 'C-1003',
      itemName: 'Scientific Calculator',
      itemImageUrl: 'assets/images/calc.jpg',
      claimantName: 'Mark Reyes',
      claimDate: '2026-04-03',
      status: 'rejected',
      proofText: 'It has my initials "MR" scratched into the back battery cover.'
    },
    {
      id: 'C-1004',
      itemName: 'MacBook Charger',
      itemImageUrl: 'assets/images/charger.jpg',
      claimantName: 'Sarah Lim',
      claimDate: '2026-04-03',
      status: 'pending',
      proofText: 'Standard Apple 61W USB-C Power Adapter. Left it plugged into the wall outlet in Room 302.'
    }
  ];

  getClaims() {
    return this.mockClaims;
  }

  // 👇 ADDED: The method to count pending claims
  getPendingClaimsCount(): Observable<number> {
    // 1. Filter the array to only get items where status is 'pending'
    // 2. Get the length of that filtered array
    const pendingCount = this.mockClaims.filter(claim => claim.status === 'pending').length;
    
    // 3. Wrap it in 'of()' to return it as an Observable, which Angular prefers for data streams
    return of(pendingCount);
  }

  updateClaim(updatedClaim: Claim) {
    const index = this.mockClaims.findIndex(c => c.id === updatedClaim.id);
    if (index !== -1) {
      // Overwrite the old claim with the newly edited data
      this.mockClaims[index] = { ...updatedClaim };
    }
  }
}