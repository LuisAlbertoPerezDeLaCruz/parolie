import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';

@Injectable({
  providedIn: 'root',
})
export class ChangesService {
  constructor(private socket: Socket) {}

  sendChange(info) {
    this.socket.emit('change', info);
  }
  receiveChange() {
    return this.socket.fromEvent('change');
  }
  getUsers() {
    return this.socket.fromEvent('users');
  }
}
