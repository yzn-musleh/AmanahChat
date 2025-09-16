import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import {jwtDecode} from 'jwt-decode';
import { environment } from '../../environment/environment';

export interface CurrentUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  isAdmin: boolean;
  workspaceId: string;
  workspaceName: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly baseUrl = environment.apiUrl || 'https://localhost:7003/api';
  private currentUserSubject = new BehaviorSubject<any>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) this.currentUserSubject.next(JSON.parse(storedUser));
  }

  setCurrentUser(user: any) {
    this.currentUserSubject.next(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
  }

  getCurrentUser() {
    return this.currentUserSubject.value;
  }

  public isLoggedIn(): boolean {
    return localStorage.getItem('token') !== null;
  }

  public logout(): void {
    // remove token 
    localStorage.removeItem('token');
  }

  // login(request: LoginUserRequest): Observable<any> {
  //   return this.http.post(`${this.baseUrl}/Users/Login`, request);
  // }

  getToken(): string | null {
    return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZDg4MDVkMS0zYjViLTRiOTktYjIyNi1lYzQ3MjkzYjI0ZDQiLCJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1lIjoieXpuIiwiV29ya3NwYWNlSWQiOiJkM2IzMzNiOS04OTYzLTRmMjUtOTkwYS1jYzhjNTZmNWZkOTYiLCJleHAiOjE3NTg1MjAzNTgsImlzcyI6IkFtYW5haENoYXQiLCJhdWQiOiJBbWFuYWhDaGF0QW5ndWxhciJ9.xEw7WmQ41clfmFcg8kK6XyvGOf9hYzcq1xd-gB42bjg';
  }

  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;

    try {
      const decoded: any = jwtDecode(token);
      const now = Math.floor(Date.now() / 1000); // Current time in seconds
      return decoded.exp && decoded.exp < now;
    } catch (err) {
      console.error('Failed to decode token', err);
      return true; // If decoding fails, treat it as expired
    }
  }
}

