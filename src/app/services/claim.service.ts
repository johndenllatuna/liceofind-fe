import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';

export interface Claim {
  id: string;
  itemId?: number; // Added to enable exact matching
  itemName: string;
  itemImageUrl: string;
  claimantName: string;
  claimantEmail: string;
  claimDate: string;
  status: 'pending' | 'verified' | 'rejected';
  proofText: string;
  evidenceImageUrl?: string;
  evidenceFileName?: string; // New field for original file name
}

@Injectable({
  providedIn: 'root'
})
export class ClaimService {

  private STORAGE_KEY = 'ldcufind_claims';
  private claimsSubject = new BehaviorSubject<Claim[]>(this.loadInitialClaims());

  constructor() { }

  private loadInitialClaims(): Claim[] {
    if (typeof window !== 'undefined' && window.localStorage) {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    }
    // Return an empty array — the table will only populate from real user submissions
    return [];
  }

  getClaims(): Observable<Claim[]> {
    return this.claimsSubject.asObservable();
  }

  submitClaim(claim: Claim) {
    const currentClaims = this.claimsSubject.getValue();
    const updatedClaims = [claim, ...currentClaims];
    this.claimsSubject.next(updatedClaims);

    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedClaims));
    }
  }

  getPendingClaimsCount(): Observable<number> {
    const pendingCount = this.claimsSubject.getValue().filter(claim => claim.status === 'pending').length;
    return of(pendingCount);
  }

  updateClaim(updatedClaim: Claim) {
    const currentClaims = this.claimsSubject.getValue();
    const index = currentClaims.findIndex(c => c.id === updatedClaim.id);

    if (index !== -1) {
      const newClaims = [...currentClaims];
      newClaims[index] = { ...updatedClaim };
      this.claimsSubject.next(newClaims);

      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(newClaims));
      }
    }
  }
}