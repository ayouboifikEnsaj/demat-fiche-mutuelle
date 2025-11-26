import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private baseUrl = 'http://localhost:8080/api/employee'; // Ajustez selon votre API

  constructor(private http: HttpClient) { }

  searchEmployees(criteria: any): Observable<any[]> {
    let params = new HttpParams();

    // Ajouter les critères de recherche aux paramètres
    Object.entries(criteria).forEach(([key, value]) => {
      if (value) {
        params = params.append(key, value as string);
      }
    });

    return this.http.get<any[]>(`${this.baseUrl}/search`, { params })
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      // Erreur côté client
      errorMessage = `Erreur: ${error.error.message}`;
    } else {
      // Erreur côté serveur
      errorMessage = `Code: ${error.status}\nMessage: ${error.message}`;
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
