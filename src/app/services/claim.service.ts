import { Injectable } from '@angular/core';

export interface Claim {
  id: string;
  itemName: string;
  itemImageUrl: string;
  claimantName: string;
  claimDate: string;
  status: 'pending' | 'verified' | 'rejected';
}

@Injectable({
  providedIn: 'root'
})
export class ClaimService {
  
  // Mock data to simulate user submissions
  private mockClaims: Claim[] = [
    {
      id: 'C-1001',
      itemName: 'Toyota Car Keys',
      itemImageUrl: 'assets/images/keys.jpg', // Use a real placeholder if you have one
      claimantName: 'John Doe',
      claimDate: '2026-04-01',
      status: 'pending'
    },
    {
      id: 'C-1002',
      itemName: 'AquaFlask Tumbler',
      itemImageUrl: 'assets/images/tumbler.jpg',
      claimantName: 'Maria Santos',
      claimDate: '2026-04-02',
      status: 'verified'
    },
    {
      id: 'C-1003',
      itemName: 'Scientific Calculator',
      itemImageUrl: 'assets/images/calc.jpg',
      claimantName: 'Mark Reyes',
      claimDate: '2026-04-03',
      status: 'rejected'
    },
    {
      id: 'C-1004',
      itemName: 'MacBook Charger',
      itemImageUrl: 'assets/images/charger.jpg',
      claimantName: 'Sarah Lim',
      claimDate: '2026-04-03',
      status: 'pending'
    }
  ];

  getClaims() {
    return this.mockClaims;
  }
}