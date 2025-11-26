import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Fiche, FichePayload, FicheUpdateDto} from '../models/Fiche';

@Injectable({
  providedIn: 'root'
})
export class FicheService {
  private baseUrl = 'http://localhost:8080/api/fiche';

  constructor(private http: HttpClient) {
  }

  getFichesByEmployeId(id: number): Observable<Fiche[]> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<Fiche[]>(`${this.baseUrl}/getFicheByEmployeId/${id}`, {headers});
  }

  getFicheById(id: number): Observable<Fiche> {
    return this.http.get<Fiche>(`${this.baseUrl}/getFicheById/${id}`);
  }

  createFiche(fiche: FichePayload, employeId: number, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('fiche', JSON.stringify(fiche));
    formData.append('employeId', employeId.toString());
    formData.append('file', file);
    return this.http.post(`${this.baseUrl}/create`, formData);
  }
  createFicheByCuid(fiche: FichePayload, cuid: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('fiche', JSON.stringify(fiche));
    formData.append('cuid', cuid);
    formData.append('file', file);
    return this.http.post(`${this.baseUrl}/create-cuid`, formData);
  }

  getAllCuids(): Observable<string[]> {
    return this.http.get<string[]>(`http://localhost:8080/api/employee/cuids`);
  }

  decodeAllQRCodes(file: File): Observable<string[]> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<string[]>('http://localhost:8080/api/fiche/decode-all-qrcodes', formData);
  }

  getAllFiches(): Observable<Fiche[]> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<Fiche[]>(`${this.baseUrl}/getAllFiches`, {headers});
  }

  validerFiche(id: number) {
    return this.http.post<Fiche>(`${this.baseUrl}/valider/${id}`, null);
  }

  rejeterFiche(id: number, commentaire?: string) {
    let params = new HttpParams();
    if (commentaire) {
      params = params.set('commentaire', commentaire);
    }
    return this.http.post<Fiche>(`${this.baseUrl}/rejeter/${id}`, null, {params});
  }

  retourPourComplement(id: number, commentaire?: string) {
    let params = new HttpParams();
    if (commentaire) {
      params = params.set('commentaire', commentaire);
    }
    return this.http.post<Fiche>(`${this.baseUrl}/retour-complement/${id}`, null, {params});
  }

  ajouterComplement(ficheId: number, formData: FormData): Observable<Fiche> {
    return this.http.put<Fiche>(
      `${this.baseUrl}/complement/${ficheId}`,
      formData
    );
  }

  exportFiches(startDate: string, endDate: string, lieuDepot?: string, typeFiche?: string): Observable<Blob> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    let params = new HttpParams()
      .set('start', startDate)
      .set('end', endDate);

    if (lieuDepot) params = params.set('lieuDepot', lieuDepot);
    if (typeFiche) params = params.set('typeFiche', typeFiche);

    return this.http.get(`${this.baseUrl}/exportfiches`, {
      headers,
      params,
      responseType: 'blob'
    });
  }

  updateFiche(ficheId: number, employeId: number, payload: FicheUpdateDto) {
    const formData = new FormData();
    formData.append('fiche', JSON.stringify(payload));
    const params = new HttpParams().set('employeId', String(employeId));
    return this.http.put(`${this.baseUrl}/update/${ficheId}`, formData, { params });
  }
}

