import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class Image {

  constructor() { }

  /**
   * Fakes an image upload to a server.
   * @param file The physical image file uploaded by the user
   * @returns An Observable containing the string URL of the "uploaded" image
   */
  uploadImage(file: File): Observable<string> {
    // 1. Create a temporary local URL so we can actually see the image on screen
    const mockCloudUrl = URL.createObjectURL(file);
    
    // 2. Return the URL, but force a 2-second delay to simulate network traffic!
    return of(mockCloudUrl).pipe(delay(2000));
  }
}