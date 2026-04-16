import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map, tap, of } from 'rxjs';

export interface Claim {
  id: string | number;
  itemId?: number;
  itemName: string;
  itemImageUrl: string;
  claimantName: string;
  claimantEmail: string;
  claimDate: string;
  status: 'pending' | 'verified' | 'rejected';
  proofText: string;
  evidenceImageUrl?: string;
  evidenceFileName?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ClaimService {
  private http = inject(HttpClient);
  private API_URL = 'http://localhost:3000/api/claims';
  
  private claimsSubject = new BehaviorSubject<Claim[]>([]);

  constructor() {
    this.refreshClaims();
  }

  refreshClaims() {
    this.http.get<any[]>(this.API_URL).pipe(
      map(rows => rows.map(row => this.mapToClaim(row)))
    ).subscribe(claims => {
      this.claimsSubject.next(claims);
    });
  }

  private mapToClaim(row: any): Claim {
    return {
      id: row.id,
      itemId: row.item_id,
      itemName: row.item_name || 'Unknown Item',
      itemImageUrl: row.item_image_url || '',
      claimantName: row.claimant_name,
      claimantEmail: row.claimant_email,
      claimDate: row.created_at,
      status: row.status,
      proofText: row.proof_text,
      evidenceImageUrl: row.evidence_image_url,
      evidenceFileName: row.evidence_file_name
    };
  }

  getClaims(): Observable<Claim[]> {
    return this.claimsSubject.asObservable();
  }

  submitClaim(claim: any): Observable<any> {
    const payload = {
      item_id: claim.itemId,
      claimant_name: claim.claimantName,
      claimant_email: claim.claimantEmail,
      proof_text: claim.proofText,
      evidence_image_url: claim.evidenceImageUrl
    };
    return this.http.post(this.API_URL, payload).pipe(
      tap(() => this.refreshClaims())
    );
  }

  updateClaim(updatedClaim: Claim): Observable<any> {
    return this.http.put(`${this.API_URL}/${updatedClaim.id}`, updatedClaim).pipe(
      tap(() => this.refreshClaims())
    );
  }

  updateClaimStatus(claimId: string | number, status: string): Observable<any> {
    return this.http.patch(`${this.API_URL}/${claimId}/status`, { status }).pipe(
      tap(() => this.refreshClaims())
    );
  }

  getPendingClaimsCount(): Observable<number> {
    return this.getClaims().pipe(
      map(claims => claims.filter(c => c.status === 'pending').length)
    );
  }
}