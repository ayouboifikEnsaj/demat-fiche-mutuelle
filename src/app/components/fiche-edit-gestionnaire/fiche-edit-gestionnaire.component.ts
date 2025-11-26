// import {Component, ElementRef, Inject, PLATFORM_ID, QueryList, ViewChildren} from '@angular/core';
// import {ActionUpdateDto, DetailsActionUpdateDto, Fiche, FicheUpdateDto} from '../../models/Fiche';
// import {FicheService} from '../../services/fiche.service';
// import {AuthService} from '../../services/auth.service';
// import {ActivatedRoute, Router} from '@angular/router';
// import {isPlatformBrowser} from '@angular/common';
//
// @Component({
//   selector: 'app-fiche-edit-gestionnaire',
//   standalone: false,
//   templateUrl: './fiche-edit-gestionnaire.component.html',
//   styleUrl: './fiche-edit-gestionnaire.component.css'
// })
// export class FicheEditGestionnaireComponent {
//   ficheId!: number;
//   employeId!: number;
//   ficheData!: Fiche;
//
//   // Affichages
//   qrCodeUrl: string = '';
//   pdfUrl: string = '';
//   showPdfViewer = false;
//   loading = false;
//   isBrowser: boolean;
//
//   // Champs éditables
//   dateConsultation: string = '';
//   typeFiche: string = '';   // désactivé dans le HTML (affichage seul)
//   typePatient: string = '';
//   lieuDepot: string = '';
//
//   // Sections pour éditer uniquement les détails (date, montant, typeDocument)
//   sections: {
//     id: string;
//     label: string;
//     actionId?: number;
//     rows: {
//       id: number;      // id DetailsAction
//       date: string;    // yyyy-MM-dd
//       amount: number;
//       typeDocument: string;
//     }[];
//   }[] = [];
//
//   // Listes déroulantes (valeurs exactes attendues par le backend)
//   typePatientOptions = [
//     { value: 'Lui_Meme', label: 'Lui Meme' },
//     { value: 'Enfant',   label: 'Enfant' },
//     { value: 'Conjoint', label: 'Conjoint' },
//   ];
//
//   lieuDepotOptions = [
//     { value: 'Casablanca', label: 'Casablanca' },
//     { value: 'Rabat',      label: 'Rabat' },
//   ];
//
//   typedocumentOptions = [
//     { value: 'Facture', label: 'Facture' },
//     { value: 'Devis',   label: 'Devis' },
//   ];
//
//   // refs pour recentrer la section ouverte
//   @ViewChildren('accItem') accItems!: QueryList<ElementRef<HTMLDivElement>>;
//
//   constructor(
//     public ficheService: FicheService,
//     public authService: AuthService,
//     public route: ActivatedRoute,
//     public router: Router,
//     @Inject(PLATFORM_ID) private platformId: Object
//   ) {
//     this.isBrowser=isPlatformBrowser(this.platformId)
//   }
//
//   ngOnInit(): void {
//     this.employeId = this.authService.getUser()!.id;
//     this.ficheId = Number(this.route.snapshot.paramMap.get('id'));
//     this.loadFiche();
//   }
//
//   openPdfViewer(fileCode: string) {
//     if (!this.isBrowser) return;
//     this.pdfUrl = `http://localhost:8080/api/attachment/view/${fileCode}`;
//     this.showPdfViewer = true;
//   }
//
//   closePdfViewer() {
//     this.showPdfViewer = false;
//     this.pdfUrl = '';
//   }
//
//   formatSectionLabel(label: string): string {
//     return label ? label.replace(/_/g, ' ') : '';
//   }
//
//
//   // Transformer "2025-06-02T00:00:00.000+00:00" -> "2025-06-02" pour <input type="date">
//   toYMD(dateLike?: string | null): string {
//     if (!dateLike) return '';
//     if (/^\d{4}-\d{2}-\d{2}$/.test(dateLike)) return dateLike;
//     return new Date(dateLike).toISOString().substring(0, 10);
//   }
//
//   loadFiche(): void {
//     this.ficheService.getFicheById(this.ficheId).subscribe({
//       next: (fiche: Fiche) => {
//         this.ficheData = fiche;
//
//         // QR code si numDossier
//         this.qrCodeUrl = fiche?.numDossier
//           ? `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(fiche.numDossier)}`
//           : '';
//
//         // Champs éditables
//         this.dateConsultation = this.toYMD(fiche.dateConsultation);
//         this.typeFiche = fiche.typeFiche || '';
//         this.typePatient = fiche.typePatient || '';
//         this.lieuDepot = fiche.lieuDepot || '';
//
//         // Mapping actions -> sections (dates converties)
//         this.sections = (fiche.actions || []).map(action => ({
//           id: action.typeAction,
//           label: action.typeAction,
//           actionId: action.id,
//           rows: (action.detailsActions || []).map(d => ({
//             id: d.id,
//             date: this.toYMD(d.dateAction),
//             amount: d.montant ?? 0,
//             typeDocument: d.typeDocument || 'Facture'
//           }))
//         }));
//       },
//       error: err => console.error(err)
//     });
//   }
//
//   buildUpdatePayload(): FicheUpdateDto {
//     const actions: ActionUpdateDto[] = this.sections.map(sec => ({
//       id: sec.actionId!, // id de l'Action existante
//       detailsActions: sec.rows.map(row => ({
//         id: row.id,             // id du DetailsAction existant
//         dateAction: row.date,   // yyyy-MM-dd
//         typeDocument: row.typeDocument,
//         montant: row.amount
//       }) as DetailsActionUpdateDto)
//     }));
//
//     return {
//       dateConsultation: this.dateConsultation || null,
//       typeFiche: this.typeFiche,
//       typePatient: this.typePatient,
//       lieuDepot: this.lieuDepot || null,
//       actions
//     };
//   }
//
//   updateFiche(): void {
//     this.loading = true;
//     const payload = this.buildUpdatePayload();
//
//     this.ficheService.updateFiche(this.ficheId, this.employeId, payload).subscribe({
//       next: () => {
//         this.loading = false;
//         alert('Fiche mise à jour avec succès');
//         this.router.navigate(['/gestionnaire-home']);
//       },
//       error: err => {
//         this.loading = false;
//         console.error(err);
//         alert('Erreur lors de la mise à jour');
//       }
//     });
//   }
//
//   // Recentrer la section ouverte au milieu de l'écran
//   onSectionShown(index: number): void {
//     setTimeout(() => {
//       const el = this.accItems.get(index)?.nativeElement;
//       if (!el) return;
//       el.scrollIntoView({ behavior: 'smooth', block: 'center' });
//     }, 0);
//   }
//   /** Recompute total from all rows' amounts and reflect it in ficheData.montantTotal */
//   recalcTotals(): void {
//     if (!this.sections) return;
//     const total = this.sections.reduce((sumSec, sec) => {
//       const secSum = (sec.rows || []).reduce((s, r) => s + (Number(r.amount) || 0), 0);
//       return sumSec + secSum;
//     }, 0);
//     // reflect in ficheData so UI shows it
//     if (this.ficheData) {
//       this.ficheData.montantTotal = total as any; // number is fine even if backend uses BigDecimal
//     }
//   }
// }
import {Component, ElementRef, Inject, PLATFORM_ID, QueryList, ViewChildren} from '@angular/core';
import {ActionUpdateDto, DetailsActionUpdateDto, Fiche, FicheUpdateDto} from '../../models/Fiche';
import {FicheService} from '../../services/fiche.service';
import {AuthService} from '../../services/auth.service';
import {ActivatedRoute, Router} from '@angular/router';
import {isPlatformBrowser} from '@angular/common';

@Component({
  selector: 'app-fiche-edit-gestionnaire',
  standalone: false,
  templateUrl: './fiche-edit-gestionnaire.component.html',
  styleUrl: './fiche-edit-gestionnaire.component.css'
})
export class FicheEditGestionnaireComponent {
  ficheId!: number;
  employeId!: number;
  ficheData!: Fiche;

  // Affichages
  qrCodeUrl: string = '';
  pdfUrl: string = '';
  showPdfViewer = false;
  loading = false;
  isBrowser: boolean;

  // Champs éditables
  dateConsultation: string = '';
  typeFiche: string = '';
  typePatient: string = '';
  lieuDepot: string = '';

  // ⚠️ NOUVEAU : Sections avec support ajout/suppression
  sections: {
    id: string;
    label: string;
    actionId?: number;
    isNew?: boolean;
    rows: {
      id?: number;
      date: string;
      amount: number;
      typeDocument: string;
      isNew?: boolean;
    }[];
  }[] = [];

  // ⚠️ NOUVEAU : Variables pour la gestion des popups
  popupVisible = false;
  currentSection: string = '';
  currentSectionIndex: number = -1;
  dateAmountRows: { id?: number; date: string; amount: number; typeDocument?: string; isNew?: boolean }[] = [];
  invalidIndexes: number[] = [];

  // Listes déroulantes
  typePatientOptions = [
    { value: 'Lui_Meme', label: 'Lui Meme' },
    { value: 'Enfant',   label: 'Enfant' },
    { value: 'Conjoint', label: 'Conjoint' },
  ];

  lieuDepotOptions = [
    { value: 'Casablanca', label: 'Casablanca' },
    { value: 'Rabat',      label: 'Rabat' },
  ];

  typedocumentOptions = [
    { value: 'Facture', label: 'Facture' },
    { value: 'Devis',   label: 'Devis' },
  ];

  // ⚠️ NOUVEAU : Sections disponibles selon le type de fiche
  availableSections: { [key: string]: { id: string; label: string }[] } = {
    'Dentaire': [
      { id: 'Soins_dentaires', label: 'Soins_dentaires' },
      { id: 'Prothése_et_orthodonie', label: 'Prothése_et_orthodonie' },
      { id: 'Pharmacie_analyses_radiographies', label: 'Pharmacie_analyses_radiographies' },
      { id: 'Pharmacie_et_soins_dentaires', label: 'Pharmacie_et_soins_dentaires' }
    ],
    'Maladie': [
      { id: 'Consultations_médicales', label: 'Consultations_médicales' },
      { id: 'Exécutions_des_ordonnances', label: 'Exécutions_des_ordonnances' },
      { id: 'Analyses_et_radiographies', label: 'Analyses_et_radiographies' },
      { id: 'Actes_médicaux_ou_paramédicaux', label: 'Actes_médicaux_ou_paramédicaux' }
    ],
    'Maternité': [
      { id: 'Consultations_médicales', label: 'Consultations_médicales' },
      { id: 'Exécutions_des_ordonnances', label: 'Exécutions_des_ordonnances' },
      { id: 'Analyses_et_radiographies', label: 'Analyses_et_radiographies' },
      { id: 'Actes_médicaux_ou_paramédicaux', label: 'Actes_médicaux_ou_paramédicaux' }
    ],
    'Optique': [
      { id: 'Consultations_médicales', label: 'Consultations_médicales' },
      { id: 'Exécutions_des_ordonnances', label: 'Exécutions_des_ordonnances' },
      { id: 'Analyses_et_radiographies', label: 'Analyses_et_radiographies' },
      { id: 'Actes_médicaux_ou_paramédicaux', label: 'Actes_médicaux_ou_paramédicaux' }
    ],
    'Traitement_Speciaux': [
      { id: 'Consultations_médicales', label: 'Consultations_médicales' },
      { id: 'Exécutions_des_ordonnances', label: 'Exécutions_des_ordonnances' },
      { id: 'Analyses_et_radiographies', label: 'Analyses_et_radiographies' },
      { id: 'Actes_médicaux_ou_paramédicaux', label: 'Actes_médicaux_ou_paramédicaux' }
    ]
  };

  @ViewChildren('accItem') accItems!: QueryList<ElementRef<HTMLDivElement>>;

  constructor(
    public ficheService: FicheService,
    public authService: AuthService,
    public route: ActivatedRoute,
    public router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    this.employeId = this.authService.getUser()!.id;
    this.ficheId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadFiche();
  }

  openPdfViewer(fileCode: string) {
    if (!this.isBrowser) return;
    this.pdfUrl = `http://localhost:8080/api/attachment/view/${fileCode}`;
    this.showPdfViewer = true;
  }

  closePdfViewer() {
    this.showPdfViewer = false;
    this.pdfUrl = '';
  }

  formatSectionLabel(label: string): string {
    return label ? label.replace(/_/g, ' ') : '';
  }

  toYMD(dateLike?: string | null): string {
    if (!dateLike) return '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateLike)) return dateLike;
    return new Date(dateLike).toISOString().substring(0, 10);
  }

  // loadFiche(): void {
  //   this.ficheService.getFicheById(this.ficheId).subscribe({
  //     next: (fiche: Fiche) => {
  //       this.ficheData = fiche;
  //
  //       this.qrCodeUrl = fiche?.numDossier
  //         ? `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(fiche.numDossier)}`
  //         : '';
  //
  //       this.dateConsultation = this.toYMD(fiche.dateConsultation);
  //       this.typeFiche = fiche.typeFiche || '';
  //       this.typePatient = fiche.typePatient || '';
  //       this.lieuDepot = fiche.lieuDepot || '';
  //
  //       // ⚠️ MODIFIÉ : Mapping avec support isNew
  //       this.sections = (fiche.actions || []).map(action => ({
  //         id: action.typeAction,
  //         label: action.typeAction,
  //         actionId: action.id,
  //         isNew: false,
  //         rows: (action.detailsActions || []).map(d => ({
  //           id: d.id,
  //           date: this.toYMD(d.dateAction),
  //           amount: d.montant ?? 0,
  //           typeDocument: d.typeDocument || 'Facture',
  //           isNew: false
  //         }))
  //       }));
  //     },
  //     error: err => console.error(err)
  //   });
  // }

  // ⚠️ NOUVEAU : Gestion des sections
  addNewSection(): void {
    const availableSectionsForType = this.availableSections[this.typeFiche] || [];
    const existingSectionIds = this.sections.map(s => s.id);
    const availableToAdd = availableSectionsForType.filter(s => !existingSectionIds.includes(s.id));

    if (availableToAdd.length === 0) {
      alert('Toutes les sections disponibles ont déjà été ajoutées.');
      return;
    }

    const newSection = availableToAdd[0];
    this.sections.push({
      id: newSection.id,
      label: newSection.label,
      isNew: true,
      rows: []
    });
  }

  removeSection(index: number): void {
    if (confirm('Voulez-vous vraiment supprimer cette section et toutes ses lignes ?')) {
      this.sections.splice(index, 1);
      this.recalcTotals();
    }
  }

  // ⚠️ NOUVEAU : Gestion des lignes (popup)
  openPopup(sectionIndex: number): void {
    if (this.popupVisible && this.currentSectionIndex === sectionIndex) {
      this.closePopup(true);
      return;
    }

    const section = this.sections[sectionIndex];
    if (!section) return;

    this.popupVisible = true;
    this.currentSection = section.id;
    this.currentSectionIndex = sectionIndex;

    this.dateAmountRows = section.rows.map(row => ({
      id: row.id,
      date: row.date,
      amount: row.amount,
      typeDocument: row.typeDocument,
      isNew: row.isNew
    }));

    if (this.dateAmountRows.length === 0) {
      this.addDateAmountRow();
    }

    this.invalidIndexes = [];
  }

  closePopup(fromChevron: boolean = false): void {
    if (fromChevron) {
      this.resetPopup();
      return;
    }

    this.invalidIndexes = [];
    this.dateAmountRows.forEach((row, i) => {
      const hasDate = !!row.date;
      const hasAmount = row.amount && row.amount > 0;
      if ((hasDate && !hasAmount) || (!hasDate && hasAmount)) {
        this.invalidIndexes.push(i);
      }
    });

    if (this.invalidIndexes.length > 0) {
      return;
    }

    const section = this.sections[this.currentSectionIndex];
    const validRows = this.dateAmountRows.filter(row => row.date && row.amount > 0);
    section.rows = validRows.map(row => ({
      id: row.id,
      date: row.date,
      amount: row.amount,
      typeDocument: row.typeDocument || 'Facture',
      isNew: row.isNew
    }));

    this.resetPopup();
    this.recalcTotals();
  }

  resetPopup(): void {
    this.popupVisible = false;
    this.currentSection = '';
    this.currentSectionIndex = -1;
    this.dateAmountRows = [];
    this.invalidIndexes = [];
  }
  // ⚠️ NOUVEAU : Charger toutes les sections fixes
  initializeAllFixedSections(): void {
    const typeFiche = this.ficheData?.typeFiche || 'Maladie';
    const fixedSectionsForType = this.availableSections[typeFiche] || [];
    const existingActions = this.ficheData?.actions || [];

    this.sections = fixedSectionsForType.map(fixedSection => {
      const existingAction = existingActions.find(action => action.typeAction === fixedSection.id);

      if (existingAction) {
        return {
          id: fixedSection.id,
          label: fixedSection.label,
          actionId: existingAction.id,
          isNew: false,
          rows: (existingAction.detailsActions || []).map(d => ({
            id: d.id,
            date: this.toYMD(d.dateAction),
            amount: d.montant ?? 0,
            typeDocument: d.typeDocument || 'Facture',
            isNew: false
          }))
        };
      } else {
        return {
          id: fixedSection.id,
          label: fixedSection.label,
          isNew: true,
          rows: []
        };
      }
    });
  }

// ⚠️ MODIFIÉ : loadFiche pour utiliser initializeAllFixedSections
  loadFiche(): void {
    this.ficheService.getFicheById(this.ficheId).subscribe({
      next: (fiche: Fiche) => {
        this.ficheData = fiche;

        this.qrCodeUrl = fiche?.numDossier
          ? `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(fiche.numDossier)}`
          : '';

        this.dateConsultation = this.toYMD(fiche.dateConsultation);
        this.typeFiche = fiche.typeFiche || '';
        this.typePatient = fiche.typePatient || '';
        this.lieuDepot = fiche.lieuDepot || '';

        // ⚠️ NOUVEAU : Charger toutes les sections fixes
        this.initializeAllFixedSections();
      },
      error: err => console.error(err)
    });
  }


  addDateAmountRow(): void {
    const needsTypeDoc = this.needsTypeDocument(this.currentSection);
    this.dateAmountRows.push({
      date: '',
      amount: 0,
      typeDocument: needsTypeDoc ? 'Facture' : 'Facture',
      isNew: true
    });
  }

  removeRow(index: number): void {
    if (confirm('Voulez-vous vraiment supprimer cette ligne ?')) {
      this.dateAmountRows.splice(index, 1);
    }
  }

  clearInvalid(index: number): void {
    const pos = this.invalidIndexes.indexOf(index);
    if (pos !== -1) {
      this.invalidIndexes.splice(pos, 1);
    }
  }

  needsTypeDocument(sectionId: string): boolean {
    const sectionsWithTypeDoc = [
      'Soins_dentaires',
      'Prothése_et_orthodonie',
      'Pharmacie_et_soins_dentaires',
      'Actes_médicaux_ou_paramédicaux'
    ];
    return sectionsWithTypeDoc.includes(sectionId);
  }

  shouldShowValidateButton(): boolean {
    return this.dateAmountRows.some(row => row.date && row.amount > 0);
  }

  getSectionTotal(sectionIndex: number): number {
    const section = this.sections[sectionIndex];
    if (!section) return 0;
    return section.rows.reduce((sum, row) => sum + (Number(row.amount) || 0), 0);
  }

  getAvailableSectionsToAdd(): { id: string; label: string }[] {
    const availableSectionsForType = this.availableSections[this.typeFiche] || [];
    const existingSectionIds = this.sections.map(s => s.id);
    return availableSectionsForType.filter(s => !existingSectionIds.includes(s.id));
  }

  // ⚠️ MODIFIÉ : buildUpdatePayload avec support nouvelles sections/lignes
  buildUpdatePayload(): FicheUpdateDto {
    const actions: ActionUpdateDto[] = [];

    this.sections.forEach(sec => {
      if (sec.rows.length === 0) return;

      const detailsActions: DetailsActionUpdateDto[] = sec.rows.map(row => ({
        id: row.id && row.id > 0 ? row.id : undefined,
        dateAction: row.date,
        typeDocument: row.typeDocument || 'Facture',
        montant: row.amount
      }));

      const action: any = {
        id: sec.actionId && sec.actionId > 0 ? sec.actionId : undefined,
        typeAction: sec.id,
        detailsActions
      };

      actions.push(action);
    });

    console.log('🔍 Payload envoyé:', JSON.stringify({ actions }, null, 2));

    return {
      dateConsultation: this.dateConsultation || null,
      typeFiche: this.typeFiche,
      typePatient: this.typePatient,
      lieuDepot: this.lieuDepot || null,
      actions
    };
  }

  updateFiche(): void {
    this.loading = true;
    const payload = this.buildUpdatePayload();

    this.ficheService.updateFiche(this.ficheId, this.employeId, payload).subscribe({
      next: () => {
        this.loading = false;
        alert('Fiche mise à jour avec succès');
        this.router.navigate(['/gestionnaire-home']);
      },
      error: err => {
        this.loading = false;
        console.error(err);
        alert('Erreur lors de la mise à jour');
      }
    });
  }

  onSectionShown(index: number): void {
    setTimeout(() => {
      const el = this.accItems.get(index)?.nativeElement;
      if (!el) return;
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 0);
  }

  recalcTotals(): void {
    if (!this.sections) return;
    const total = this.sections.reduce((sumSec, sec) => {
      const secSum = (sec.rows || []).reduce((s, r) => s + (Number(r.amount) || 0), 0);
      return sumSec + secSum;
    }, 0);

    if (this.ficheData) {
      this.ficheData.montantTotal = total;
    }
  }
}

