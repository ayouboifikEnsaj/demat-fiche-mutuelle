export interface DetailsAction {
  id: number;
  dateAction: string;
  typeDocument: string;
  montant: number;
}

export interface Action {
  id: number;
  typeAction: string;
  montantAction: number;
  detailsActions: DetailsAction[];
}

export interface Attachment {
  id: number;
  name: string;
  size: number;
  type: string;
  extension: string;
  file: string;
}

export interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  pims: number;
  cuid: string;
}

export interface Fiche {
  id: number;
  dateSoumission: string;
  dateConsultation: string;
  numDossier: string;
  montantTotal: number;
  statutFiche: string;
  typeFiche: string;
  typePatient: string;
  lieuDepot: string;
  dossier: Attachment;
  complement:Attachment;
  actions: Action[];
  employee: Employee;
}

export interface FichePayload {
  numDossier:string;
  dateConsultation: string;
  typeFiche: string;
  typePatient: string;
  lieuDepot: string;
  actions: {
    typeAction: string;
    detailsActions: {
      dateAction: string;
      typeDocument: string;
      montant: number;
    }[];
  }[];
}

//Model utilisable pour la modification des fiches
export interface DetailsActionUpdateDto {
  id?: number;
  dateAction: string;
  typeDocument: string;
  montant: number;
}

// export interface ActionUpdateDto {
//   id: number;
//   detailsActions: DetailsActionUpdateDto[];
// }
export interface ActionUpdateDto {
  id?: number; // Optionnel pour les nouvelles sections
  typeAction?: string; // Nécessaire pour les nouvelles sections
  detailsActions: DetailsActionUpdateDto[];
}
export interface FicheUpdateDto {
  dateConsultation: string | null;
  typeFiche: string;
  typePatient: string;
  lieuDepot: string | null;
  actions: ActionUpdateDto[];
}


