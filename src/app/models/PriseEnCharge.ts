// src/app/models/PriseEnCharge.ts
import { EmployeeResponse } from './employeresponse';

export interface PriseEnCharge {
  id?: number;
  dateSoumission?: string;
  motif: string;
  montant: number;
  statutPriseEnCharge: string;
  dossier?: {
    id?: number;
    file: string;
    name?: string;
  };
  pliConfidentiel?: {
    id?: number;
    file: string;
    name?: string;
  };
  complement?: {
    id?: number;
    file: string;
    name?: string;
  };
  accord?: {
    id?: number;
    file: string;
    name?: string;
  };
  employee?: EmployeeResponse;
  [key: string]: any;
  typeIntervention?: string;
  typeOperation?: string;
  dateOperation?: string;
  documentComplementaire?: any;
  commentaireRetour?: string;
}
