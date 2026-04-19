import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket;
  private readonly url = 'http://localhost:3000'; // Replace with your backend URL if different

  constructor() {
    this.socket = io(this.url);
    
    this.socket.on('connect', () => {
      console.log('Connected to WebSocket server');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
    });
  }

  // Listen for specific events
  onEvent<T>(eventName: string): Observable<T> {
    return new Observable<T>(observer => {
      this.socket.on(eventName, (data: T) => {
        observer.next(data);
      });
    });
  }

  onClaimStatusUpdated(): Observable<{ id: number, status: string }> {
    return this.onEvent<{ id: number, status: string }>('claim_status_updated');
  }

  // Emit events if needed
  emitEvent(eventName: string, data: any) {
    this.socket.emit(eventName, data);
  }
}
