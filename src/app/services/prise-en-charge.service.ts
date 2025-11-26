// src/app/services/prise-en-charge.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PriseEnCharge } from '../models/PriseEnCharge';

@Injectable({
  providedIn: 'root'
})
export class PriseEnChargeService {
  private apiUrl = `http://localhost:8080/api/priseencharge`;

  constructor(private http: HttpClient) { }

  // Créer une prise en charge
  createPriseEnCharge(priseEnCharge: PriseEnCharge, employeeId: number, dossierFile: File, pliConfidentielFile: File ,documentComplementaireFile?: File): Observable<PriseEnCharge> {
    const formData = new FormData();
    formData.append('priseEnCharge', JSON.stringify(priseEnCharge));
    formData.append('employeeId', employeeId.toString());
    formData.append('dossierFile', dossierFile);
    formData.append('pliConfidentielFile', pliConfidentielFile);
    if (documentComplementaireFile) {
      formData.append('documentComplementaireFile', documentComplementaireFile);
    }
    return this.http.post<PriseEnCharge>(`${this.apiUrl}/create1`, formData);
  }
// src/app/services/prise-en-charge.service.ts

// Mettre à jour la méthode updatePriseEnCharge
  updatePriseEnCharge(
    id: number,
    priseEnCharge: Partial<PriseEnCharge>,
    employeeId: number,
    dossierFile?: File,
    pliConfidentielFile?: File,
    documentComplementaireFile?: File
  ): Observable<PriseEnCharge> {
    const formData = new FormData();
    formData.append('priseEnCharge', JSON.stringify(priseEnCharge));
    formData.append('employeeId', employeeId.toString());

    if (dossierFile) {
      formData.append('dossierFile', dossierFile);
    }
    if (pliConfidentielFile) {
      formData.append('pliConfidentielFile', pliConfidentielFile);
    }
    if (documentComplementaireFile) {
      formData.append('documentComplementaireFile', documentComplementaireFile);
    }

    return this.http.put<PriseEnCharge>(`${this.apiUrl}/update1/${id}`, formData);
  }



  // Ajouter un document complémentaire
  ajouterComplement(priseEnChargeId: number, complementFile: FormData): Observable<PriseEnCharge> {
    return this.http.put<PriseEnCharge>(`${this.apiUrl}/complement/${priseEnChargeId}`, complementFile);
  }

  // Ajouter un document d'accord
  ajouterAccord(id: number, formData: FormData): Observable<PriseEnCharge> {
    return this.http.put<PriseEnCharge>(`${this.apiUrl}/accord/${id}`, formData);
  }

  // Obtenir une prise en charge par ID
  getPriseEnChargeById(id: number): Observable<PriseEnCharge> {
    return this.http.get<PriseEnCharge>(`${this.apiUrl}/${id}`);
  }

  // Obtenir les prises en charge d'un employé
  getPriseEnChargesByEmployeeId(employeeId: number): Observable<PriseEnCharge[]> {
    return this.http.get<PriseEnCharge[]>(`${this.apiUrl}/employee/${employeeId}`);
  }

  // Obtenir toutes les prises en charge
  getAllPriseEnCharges(): Observable<PriseEnCharge[]> {
    return this.http.get<PriseEnCharge[]>(`${this.apiUrl}`);
  }

  // Valider une prise en charge
  validerPriseEnCharge(id: number): Observable<PriseEnCharge> {
    return this.http.post<PriseEnCharge>(`${this.apiUrl}/valider/${id}`, {});
  }

  // Rejeter une prise en charge
  rejeterPriseEnCharge(id: number, commentaire?: string): Observable<PriseEnCharge> {
    let params = new HttpParams();
    if (commentaire) {
      params = params.set('commentaire', commentaire);
    }
    return this.http.post<PriseEnCharge>(`${this.apiUrl}/rejeter/${id}`, {}, { params });
  }

  // Retourner pour complément
  retourPourComplement(id: number, commentaire?: string): Observable<PriseEnCharge> {
    let params = new HttpParams();
    if (commentaire) {
      params = params.set('commentaire', commentaire);
    }
    return this.http.post<PriseEnCharge>(`${this.apiUrl}/retour-complement/${id}`, {}, { params });
  }

  // Marquer en cours de traitement
  marquerEnCoursTraitement(id: number): Observable<PriseEnCharge> {
    return this.http.post<PriseEnCharge>(`${this.apiUrl}/en-cours-traitement/${id}`, {});
  }

  // Télécharger le modèle de fiche
  telechargerModeleFiche(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/modele-fiche`, {
      responseType: 'blob'
    });
  }
}
