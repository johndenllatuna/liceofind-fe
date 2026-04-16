import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Image {
  private http = inject(HttpClient);
  private API_URL = 'http://localhost:3000/api/upload';

  /**
   * Uploads an image file to the server.
   * @param file The physical image file uploaded by the user
   * @returns An Observable containing the string URL of the uploaded image
   */
  uploadImage(file: File): Observable<string> {
    const formData = new FormData();
    formData.append('image', file);
    
    return this.http.post<{ url: string }>(this.API_URL, formData).pipe(
      map(response => response.url)
    );
  }

  /**
   * Uploads an inquiry evidence image to the proofUploads folder.
   */
  uploadProof(file: File): Observable<string> {
    const formData = new FormData();
    formData.append('image', file);
    
    return this.http.post<{ url: string }>(`${this.API_URL}/proof`, formData).pipe(
      map(response => response.url)
    );
  }
}