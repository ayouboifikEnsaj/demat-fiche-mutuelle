import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LoginEmployeDto } from '../models/login-employe.dto';
import {LoginResponse} from '../models/loginresponse';
import {EmployeeResponse} from '../models/employeresponse';
import {Router} from '@angular/router';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://localhost:8080/auth'; // correspond à @RequestMapping("/auth") dans Spring

  constructor(private http: HttpClient , private router: Router) {}

  login(credentials: LoginEmployeDto): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/login`, credentials);
  }
  getUser(): EmployeeResponse | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  logout(): void {
    localStorage.clear();
  }

  getUserRole(): string {
    const user = this.getUser();
    if (!user || !user.role) return '';

    // Si le rôle est un objet avec une propriété 'value'
    if (typeof user.role === 'object' && user.role) {
      return user.role;
    }

    // Si le rôle est une chaîne
    return typeof user.role === 'string' ? user.role : '';
  }

  redirectBasedOnRole(): void {
    const role = this.getUserRole().toLowerCase();

    if (role.includes('gestionnaire')) {
      this.router.navigate(['/gestionnaire-home']);
    } else if (role.includes('admin')) {
      this.router.navigate(['/gestionnaire-home']);
    } else {
      // Par défaut, rediriger vers la page des employés
      this.router.navigate(['/employes-home']);
    }
  }



}
