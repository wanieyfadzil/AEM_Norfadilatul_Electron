
import { Injectable } from '@angular/core';
import PouchDB from 'pouchdb-browser';

interface OfflineUser {
  _id: string;
  type: 'offline-user';
  username: string;
  passwordHash: string;
  salt: string;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class OfflineAuthService {
  private db = new PouchDB('aem_offline_auth');

  private async hashPassword(
    password: string,
    salt: string
  ): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(`${salt}:${password}`);

    const hash = await crypto.subtle.digest('SHA-256', data);

    return Array.from(new Uint8Array(hash))
      .map(byte => byte.toString(16).padStart(2, '0'))
      .join('');
  }

  async saveVerifiedUser(
    username: string,
    password: string
  ): Promise<void> {
    const normalizedUsername = username.trim().toLowerCase();
    const salt = crypto.randomUUID();
    const passwordHash = await this.hashPassword(password, salt);
    const id = `user:${normalizedUsername}`;

    const user: OfflineUser = {
      _id: id,
      type: 'offline-user',
      username: normalizedUsername,
      passwordHash,
      salt,
      createdAt: new Date().toISOString()
    };

    try {
      const existing = await this.db.get(id);
      await this.db.put({
        ...user,
        _rev: existing._rev
      });
    } catch (error: any) {
      if (error.status === 404) {
        await this.db.put(user);
      } else {
        throw error;
      }
    }
  }

  async verifyOffline(
    username: string,
    password: string
  ): Promise<boolean> {
    const id = `user:${username.trim().toLowerCase()}`;

    try {
      const user = await this.db.get(id) as OfflineUser;
      const passwordHash = await this.hashPassword(
        password,
        user.salt
      );

      return passwordHash === user.passwordHash;
    } catch {
      return false;
    }
  }
}