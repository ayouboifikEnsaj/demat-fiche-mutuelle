// src/app/components/prise-en-charge-form/prise-en-charge-form.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { PriseEnChargeService } from '../../services/prise-en-charge.service';
import { AuthService } from '../../services/auth.service';
import { TranslateService } from '@ngx-translate/core';
import { HttpErrorResponse } from '@angular/common/http';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-prise-en-charge-form',
  templateUrl: './prise-en-charge-form.component.html',
  standalone: false,
  styleUrls: ['./prise-en-charge-form.component.css']
})
export class PriseEnChargeFormComponent implements OnInit {
  priseEnChargeForm: FormGroup;
  dossierFile: File | null = null;
  pliConfidentielFile: File | null = null;
  isSubmitting = false;
  errorMessage = '';
  previewDossier: SafeResourceUrl | null = null;
  previewPliConfidentiel: SafeResourceUrl | null = null;
  showNotificationModal = false;
  isEditMode = false;
  priseEnChargeId: number | null = null;
// Dans la classe PriseEnChargeFormComponent
  today = new Date();
  // Ajout de variables pour stocker les informations des fichiers existants
  existingDossierFileCode: string | null = null;
  existingPliConfidentielFileCode: string | null = null;
  existingDossierFileName: string | null = null;
  existingPliConfidentielFileName: string | null = null;

  // Indicateurs pour savoir si l'utilisateur a changé les fichiers
  dossierFileChanged = false;
  pliConfidentielFileChanged = false;

  typeIntervention: 'operation' | 'hospitalisation' | null = null;
  typeOperation: 'prevue' | 'effectuee' | null = null;
  dateOperation: string = '';
  isDateOperationValid: boolean = true;
  dateOperationErrorMessage: string = '';
  documentsComplementairesFiles: File[] = [];
  existingDocumentsComplementaires: { code: string, name: string }[] = [];
  previewDocumentsComplementaires: SafeResourceUrl[] = [];
  documentComplementaireFile: File | null = null;
  previewDocumentComplementaire: SafeResourceUrl | null = null;
  existingDocumentComplementaireFileCode: string | null = null;
  existingDocumentComplementaireFileName: string | null = null;
  documentComplementaireFileChanged = false;

  constructor(
    private fb: FormBuilder,
    private priseEnChargeService: PriseEnChargeService,
    private authService: AuthService,
    private router: Router,
    private translateService: TranslateService,
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer
  ) {
    this.priseEnChargeForm = this.fb.group({
      motif: ['', [Validators.required, Validators.minLength(5)]],
      montant: ['', [Validators.required, Validators.min(0)]],
      typeIntervention: ['', [Validators.required]],
      typeOperation: [''],
      dateOperation: ['']
    });
    this.initTranslateService();
  }
  // Nouvelle méthode pour gérer le changement de type d'intervention
  onTypeInterventionChange(type: 'operation' | 'hospitalisation'): void {
    this.typeIntervention = type;
    this.priseEnChargeForm.patchValue({ typeIntervention: type });

    // Réinitialiser les champs liés à l'opération si on change pour hospitalisation
    if (type === 'hospitalisation') {
      this.typeOperation = null;
      this.dateOperation = '';
      this.isDateOperationValid = true;
      this.dateOperationErrorMessage = '';
      this.priseEnChargeForm.patchValue({
        typeOperation: '',
        dateOperation: ''
      });
    }
  }
  onDocumentsComplementairesSelected(event: any): void {
    const files = event.target.files;
    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type !== 'application/pdf') {
          this.translateService.get('FORMAT_PDF_REQUIS').subscribe(msg => {
            alert(msg);
          });
          event.target.value = '';
          return;
        }
        this.documentsComplementairesFiles.push(file);
        this.createPreviewForComplementaryDoc(file);
      }
    }
  }
  onDocumentComplementaireFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        this.translateService.get('FORMAT_PDF_REQUIS').subscribe(msg => {
          alert(msg);
        });
        event.target.value = '';
        return;
      }
      this.documentComplementaireFile = file;
      this.documentComplementaireFileChanged = true;
      this.createPreviewForDocumentComplementaire(file);
    }
  }
  // Méthode pour créer une prévisualisation du document complémentaire
  createPreviewForDocumentComplementaire(file: File): void {
    const reader = new FileReader();
    reader.onload = () => {
      this.previewDocumentComplementaire = this.sanitizer.bypassSecurityTrustResourceUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

// Méthode pour supprimer le document complémentaire existant
  // Méthode pour créer une prévisualisation pour un document complémentaire
  createPreviewForComplementaryDoc(file: File): void {
    const reader = new FileReader();
    reader.onload = () => {
      this.previewDocumentsComplementaires.push(
        this.sanitizer.bypassSecurityTrustResourceUrl(reader.result as string)
      );
    };
    reader.readAsDataURL(file);
  }

  // Méthode pour supprimer un document complémentaire
  supprimerDocumentComplementaire(index: number): void {
    this.documentsComplementairesFiles.splice(index, 1);
    this.previewDocumentsComplementaires.splice(index, 1);
  }

  // Méthode pour supprimer un document complémentaire existant
// Méthode pour supprimer le document complémentaire existant
  supprimerDocumentComplementaireExistant(): void {
    this.existingDocumentComplementaireFileCode = null;
    this.existingDocumentComplementaireFileName = null;
    this.previewDocumentComplementaire = null;
  }

  // Nouvelle méthode pour gérer le changement de type d'opération
  onTypeOperationChange(type: 'prevue' | 'effectuee'): void {
    this.typeOperation = type;
    this.priseEnChargeForm.patchValue({ typeOperation: type });

    // Réinitialiser la date d'opération si on change pour opération prévue
    if (type === 'prevue') {
      this.dateOperation = '';
      this.isDateOperationValid = true;
      this.dateOperationErrorMessage = '';
      this.priseEnChargeForm.patchValue({ dateOperation: '' });
    }
  }

  // Nouvelle méthode pour vérifier la date d'opération
  verifierDateOperation(): void {
    if (!this.dateOperation) {
      this.isDateOperationValid = false;
      this.translateService.get('DATE_OPERATION_REQUISE').subscribe(msg => {
        this.dateOperationErrorMessage = msg;
      });
      return;
    }

    const dateOp = new Date(this.dateOperation);
    const maintenant = new Date();

    // Calculer la différence en heures
    const diffMs = maintenant.getTime() - dateOp.getTime();
    const diffHeures = diffMs / (1000 * 60 * 60);

    if (diffHeures > 48) {
      this.isDateOperationValid = false;
      this.translateService.get('DATE_OPERATION_HORS_DELAI').subscribe(msg => {
        this.dateOperationErrorMessage = msg;
      });
    } else {
      this.isDateOperationValid = true;
      this.dateOperationErrorMessage = '';
      this.translateService.get('DATE_OPERATION_VALIDE').subscribe(msg => {
        alert(msg);
      });
    }
  }
  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id'); // récupérer l'id de l'URL

    if (id) {
      this.isEditMode = true;
      this.priseEnChargeId = +id;

      // Charger la prise en charge existante
      this.priseEnChargeService.getPriseEnChargeById(this.priseEnChargeId).subscribe({
        next: (priseEnCharge) => {
          console.log('Prise en charge chargée:', priseEnCharge);

          // Remplir le formulaire avec les données existantes
          this.priseEnChargeForm.patchValue({
            motif: priseEnCharge.motif,
            montant: priseEnCharge.montant
          });

          // Charger les données de type d'intervention
          if (priseEnCharge.typeIntervention) {
            this.typeIntervention = priseEnCharge.typeIntervention as 'operation' | 'hospitalisation';
            this.priseEnChargeForm.patchValue({ typeIntervention: this.typeIntervention });

            // Si c'est une opération, charger le type d'opération
            if (this.typeIntervention === 'operation' && priseEnCharge.typeOperation) {
              this.typeOperation = priseEnCharge.typeOperation as 'prevue' | 'effectuee';
              this.priseEnChargeForm.patchValue({ typeOperation: this.typeOperation });

              // Si c'est une opération déjà effectuée, charger et vérifier la date
              if (this.typeOperation === 'effectuee' && priseEnCharge.dateOperation) {
                const dateOp = new Date(priseEnCharge.dateOperation);
                this.dateOperation = dateOp.toISOString().split('T')[0];
                this.priseEnChargeForm.patchValue({ dateOperation: this.dateOperation });

                // Vérifier si la date est dans les 48h
                const maintenant = new Date();
                const diffMs = maintenant.getTime() - dateOp.getTime();
                const diffHeures = diffMs / (1000 * 60 * 60);

                this.isDateOperationValid = diffHeures <= 48;
                if (!this.isDateOperationValid) {
                  this.translateService.get('DATE_OPERATION_HORS_DELAI').subscribe(msg => {
                    this.dateOperationErrorMessage = msg;
                  });
                }
              }
            }
          }

          // Gérer le fichier dossier existant
          if (priseEnCharge.dossier && priseEnCharge.dossier.file) {
            this.existingDossierFileCode = priseEnCharge.dossier.file;
            this.existingDossierFileName = priseEnCharge.dossier.name || 'dossier.pdf';

            // Créer l'URL pour la prévisualisation
            const dossierUrl = `http://localhost:8080/api/attachment/view/${priseEnCharge.dossier.file}`;
            this.previewDossier = this.sanitizer.bypassSecurityTrustResourceUrl(dossierUrl);
          }

          // Gérer le fichier pli confidentiel existant
          if (priseEnCharge.pliConfidentiel && priseEnCharge.pliConfidentiel.file) {
            this.existingPliConfidentielFileCode = priseEnCharge.pliConfidentiel.file;
            this.existingPliConfidentielFileName = priseEnCharge.pliConfidentiel.name || 'pli-confidentiel.pdf';

            // Créer l'URL pour la prévisualisation
            const pliUrl = `http://localhost:8080/api/attachment/view/${priseEnCharge.pliConfidentiel.file}`;
            this.previewPliConfidentiel = this.sanitizer.bypassSecurityTrustResourceUrl(pliUrl);
          }
          // Gérer le document complémentaire existant
          if (priseEnCharge.documentComplementaire && priseEnCharge.documentComplementaire.file) {
            this.existingDocumentComplementaireFileCode = priseEnCharge.documentComplementaire.file;
            this.existingDocumentComplementaireFileName = priseEnCharge.documentComplementaire.name || 'document-complementaire.pdf';

            // Créer l'URL pour la prévisualisation
            const documentComplementaireUrl = `http://localhost:8080/api/attachment/view/${priseEnCharge.documentComplementaire.file}`;
            this.previewDocumentComplementaire = this.sanitizer.bypassSecurityTrustResourceUrl(documentComplementaireUrl);
          }

          // Si le statut est "Retour pour complément d'informations", vérifier s'il y a un fichier de complément existant
          if (priseEnCharge.statutPriseEnCharge === "Retour_complement_d'informations" &&
            priseEnCharge.complement && priseEnCharge.complement.file) {
            // Utiliser le fichier de complément comme document complémentaire
            this.existingDocumentComplementaireFileCode = priseEnCharge.complement.file;
            this.existingDocumentComplementaireFileName = priseEnCharge.complement.name || 'complement.pdf';

            // Créer l'URL pour la prévisualisation
            const complementUrl = `http://localhost:8080/api/attachment/view/${priseEnCharge.complement.file}`;
            this.previewDocumentComplementaire = this.sanitizer.bypassSecurityTrustResourceUrl(complementUrl);
          }
        },
        error: (err) => {
          console.error('Erreur lors du chargement de la prise en charge', err);
          this.translateService.get('ERREUR_CHARGEMENT').subscribe(msg => {
            this.errorMessage = msg;
          });
        }
      });
    }
  }


  // ngOnInit(): void {
  //   const id = this.route.snapshot.paramMap.get('id'); // récupérer l'id de l'URL
  //
  //   if (id) {
  //     this.isEditMode = true;
  //     this.priseEnChargeId = +id;
  //
  //     // Charger la prise en charge existante
  //     this.priseEnChargeService.getPriseEnChargeById(this.priseEnChargeId).subscribe({
  //       next: (priseEnCharge) => {
  //         console.log('Prise en charge chargée:', priseEnCharge);
  //
  //         // Remplir le formulaire avec les données existantes
  //         this.priseEnChargeForm.patchValue({
  //           motif: priseEnCharge.motif,
  //           montant: priseEnCharge.montant
  //         });
  //
  //         // Gérer le fichier dossier existant
  //         if (priseEnCharge.dossier && priseEnCharge.dossier.file) {
  //           this.existingDossierFileCode = priseEnCharge.dossier.file;
  //           this.existingDossierFileName = priseEnCharge.dossier.name || 'dossier.pdf';
  //
  //           // Créer l'URL pour la prévisualisation
  //           const dossierUrl = `http://localhost:8080/api/attachment/view/${priseEnCharge.dossier.file}`;
  //           this.previewDossier = this.sanitizer.bypassSecurityTrustResourceUrl(dossierUrl);
  //         }
  //
  //         // Gérer le fichier pli confidentiel existant
  //         if (priseEnCharge.pliConfidentiel && priseEnCharge.pliConfidentiel.file) {
  //           this.existingPliConfidentielFileCode = priseEnCharge.pliConfidentiel.file;
  //           this.existingPliConfidentielFileName = priseEnCharge.pliConfidentiel.name || 'pli-confidentiel.pdf';
  //
  //           // Créer l'URL pour la prévisualisation
  //           const pliUrl = `http://localhost:8080/api/attachment/view/${priseEnCharge.pliConfidentiel.file}`;
  //           this.previewPliConfidentiel = this.sanitizer.bypassSecurityTrustResourceUrl(pliUrl);
  //         }
  //
  //       },
  //       error: (err) => {
  //         console.error('Erreur lors du chargement de la prise en charge', err);
  //         this.translateService.get('ERREUR_CHARGEMENT').subscribe(msg => {
  //           this.errorMessage = msg;
  //         });
  //       }
  //     });
  //   }
  // }

  initTranslateService(): void {
    this.translateService.addLangs(['fr', 'en']);
    this.translateService.setDefaultLang('en');
    const savedLang = localStorage.getItem('lang');
    const langToUse = savedLang || 'en';
    this.translateService.use(langToUse);
  }

  onDossierFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        this.translateService.get('FORMAT_PDF_REQUIS').subscribe(msg => {
          alert(msg);
        });
        event.target.value = '';
        return;
      }
      this.dossierFile = file;
      this.dossierFileChanged = true;
      this.createPreview(file, 'dossier');
    }
  }

  onPliConfidentielFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        this.translateService.get('FORMAT_PDF_REQUIS').subscribe(msg => {
          alert(msg);
        });
        event.target.value = '';
        return;
      }
      this.pliConfidentielFile = file;
      this.pliConfidentielFileChanged = true;
      this.createPreview(file, 'pliConfidentiel');
    }
  }

  createPreview(file: File, type: 'dossier' | 'pliConfidentiel'): void {
    const reader = new FileReader();
    reader.onload = () => {
      if (type === 'dossier') {
        this.previewDossier = this.sanitizer.bypassSecurityTrustResourceUrl(reader.result as string);
      } else {
        this.previewPliConfidentiel = this.sanitizer.bypassSecurityTrustResourceUrl(reader.result as string);
      }
    };
    reader.readAsDataURL(file);
  }

  onSubmit(): void {
    if (this.priseEnChargeForm.invalid) {
      this.translateService.get('FORMULAIRE_INVALIDE').subscribe(msg => {
        this.errorMessage = msg;
      });
      return;
    }
    if (this.typeIntervention === 'operation' && this.typeOperation === 'effectuee') {
      if (!this.dateOperation) {
        this.translateService.get('DATE_OPERATION_REQUISE').subscribe(msg => {
          this.errorMessage = msg;
        });
        return;
      }

      if (!this.isDateOperationValid) {
        this.translateService.get('DATE_OPERATION_HORS_DELAI').subscribe(msg => {
          this.errorMessage = msg;
        });
        return;
      }
    }


    // Vérification des fichiers uniquement en création
    if (!this.isEditMode) {
      if (!this.dossierFile) {
        this.translateService.get('FICHE_PRISE_EN_CHARGE_REQUISE').subscribe(msg => {
          this.errorMessage = msg;
        });
        return;
      }

      if (!this.pliConfidentielFile) {
        this.translateService.get('PLI_CONFIDENTIEL_REQUIS').subscribe(msg => {
          this.errorMessage = msg;
        });
        return;
      }
    } else {
      // En mode édition, vérifier qu'au moins un des fichiers existe (soit nouveau, soit existant)
      if (!this.dossierFile && !this.existingDossierFileCode) {
        this.translateService.get('FICHE_PRISE_EN_CHARGE_REQUISE').subscribe(msg => {
          this.errorMessage = msg;
        });
        return;
      }

      if (!this.pliConfidentielFile && !this.existingPliConfidentielFileCode) {
        this.translateService.get('PLI_CONFIDENTIEL_REQUIS').subscribe(msg => {
          this.errorMessage = msg;
        });
        return;
      }
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const user = this.authService.getUser();
    if (!user || !user.id) {
      this.translateService.get('UTILISATEUR_NON_CONNECTE').subscribe(msg => {
        this.errorMessage = msg;
      });
      this.isSubmitting = false;
      return;
    }

    const priseEnCharge: any = {
      motif: this.priseEnChargeForm.value.motif,
      montant: this.priseEnChargeForm.value.montant,
      statutPriseEnCharge: 'En_attente',
      typeIntervention: this.typeIntervention,
      typeOperation: this.typeOperation,
      dateOperation: this.dateOperation ? new Date(this.dateOperation).toISOString() : null
    };

    if (this.isEditMode && this.priseEnChargeId) {
      // --- Mode édition ---
      this.priseEnChargeService.updatePriseEnCharge(
        this.priseEnChargeId,
        priseEnCharge,
        user.id,
        this.dossierFileChanged && this.dossierFile ? this.dossierFile : undefined,
        this.pliConfidentielFileChanged && this.pliConfidentielFile ? this.pliConfidentielFile : undefined,
        this.documentComplementaireFileChanged && this.documentComplementaireFile ? this.documentComplementaireFile : undefined
      ).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.translateService.get('PRISE_EN_CHARGE_MODIFIEE').subscribe(msg => alert(msg));
          this.router.navigate(['/prise-en-charge']);
        },
        error: (error: HttpErrorResponse) => {
          this.isSubmitting = false;
          console.error('Erreur lors de la modification de la prise en charge', error);
          this.translateService.get('ERREUR_MODIFICATION').subscribe(msg => {
            this.errorMessage = msg + (error.error?.message ? ': ' + error.error.message : '');
          });
        }
      });
    } else {
      // --- Mode création ---
      if (this.dossierFile && this.pliConfidentielFile) {
        this.priseEnChargeService.createPriseEnCharge(
          priseEnCharge,
          user.id,
          this.dossierFile,
          this.pliConfidentielFile,
          this.documentComplementaireFile || undefined
        ).subscribe({
          next: () => {
            this.isSubmitting = false;
            this.translateService.get('PRISE_EN_CHARGE_CREEE').subscribe(msg => alert(msg));
            this.router.navigate(['/prise-en-charge']);
          },
          error: (error: HttpErrorResponse) => {
            this.isSubmitting = false;
            console.error('Erreur lors de la création de la prise en charge', error);
            this.translateService.get('ERREUR_CREATION').subscribe(msg => {
              this.errorMessage = msg + (error.error?.message ? ': ' + error.error.message : '');
            });
          }
        });
      } else {
        console.error('Veuillez téléverser le pli confidentiel et le dossier');
        this.isSubmitting = false;
        this.translateService.get('FICHIERS_REQUIS').subscribe(msg => {
          this.errorMessage = msg;
        });
      }
    }
  }

  telechargerModeleFiche(): void {
    // Affiche uniquement le modal de notification
    this.showNotificationModal = true;
  }

  closeNotification(): void {
    this.showNotificationModal = false;

    // Après fermeture du modal, lancer le téléchargement
    this.priseEnChargeService.telechargerModeleFiche().subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'modele-prise-en-charge.pdf';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      },
      error: (error) => {
        console.error('Erreur lors du téléchargement du modèle', error);
        this.translateService.get('ERREUR_TELECHARGEMENT').subscribe(msg => {
          alert(msg);
        });
      }
    });
  }

  // Méthode pour confirmer l'annulation du formulaire
  confirmerAnnulation(): void {
    this.translateService.get('CONFIRMER_ANNULATION').subscribe(msg => {
      if (confirm(msg)) {
        this.router.navigate(['/prise-en-charge']);
      }
    });
  }

  // Méthode pour supprimer le fichier dossier existant
  supprimerDossierExistant(): void {
    this.existingDossierFileCode = null;
    this.existingDossierFileName = null;
    this.previewDossier = null;
  }

  // Méthode pour supprimer le fichier pli confidentiel existant
  supprimerPliConfidentielExistant(): void {
    this.existingPliConfidentielFileCode = null;
    this.existingPliConfidentielFileName = null;
    this.previewPliConfidentiel = null;
  }

  // Méthode pour télécharger un fichier existant
  telechargerFichierExistant(fileCode: string | null, fileName: string): void {
    if (!fileCode) return;

    const url = `http://localhost:8080/api/attachment/download/${fileCode}`;
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
}
