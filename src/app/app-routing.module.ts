import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EmployesHomeComponent } from './components/employes-home/employes-home.component';
import { GestionnaireHomeComponent } from './components/gestionnaire-home/gestionnaire-home.component';
import { FicheMedicalFormComponent } from './components/fiche-medical-form/fiche-medical-form.component';
import { FicheDentaireFormComponent } from './components/fiche-dentaire-form/fiche-dentaire-form.component';
import { LoginComponent } from './components/login/login.component';
import {FicheDetailComponent} from './components/fiche-detail/fiche-detail.component';
import {EmployesTableComponent} from './components/employes-table/employes-table.component';
import {
  FicheDetailGestionnaireComponent
} from './components/fiche-detail-gestionnaire/fiche-detail-gestionnaire.component';
import {FicheEditComponent} from './components/fiche-edit/fiche-edit.component';
import {FicheMedicalAutoComponent} from './components/fiche-medical-auto/fiche-medical-auto.component';
import {FicheDentaireAutoComponent} from './components/fiche-dentaire-auto/fiche-dentaire-auto.component';
import {FicheEditGestionnaireComponent} from './components/fiche-edit-gestionnaire/fiche-edit-gestionnaire.component';
import {EmployeeSearchComponent} from './components/newfiche/employee-search.component';
import {PriseEnChargeTableComponent} from './components/prise-en-charge-table/prise-en-charge-table.component';
import {PriseEnChargeFormComponent} from './components/prise-en-charge-form/prise-en-charge-form.component';
import {
  PriseEnChargeDetailGestionnaireComponent
} from './components/prise-en-charge-detail-gestionnaire/prise-en-charge-detail-gestionnaire.component';
import {PriseEnChargeDetailComponent} from './components/prise-en-charge-detail/prise-en-charge-detail.component';
import {
  PriseEnChargeGestionnaireTableComponent
} from './components/prise-en-charge-gestionnaire-table/prise-en-charge-gestionnaire-table.component';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'employes-home', component: EmployesHomeComponent },
  { path: 'search-employee', component: EmployeeSearchComponent },
  { path: 'gestionnaire-home', component: GestionnaireHomeComponent },
  { path: 'medical-fiche', component: FicheMedicalFormComponent },
  { path: 'medical-fiche-auto', component: FicheMedicalAutoComponent },
  { path: 'dentaire-fiche', component: FicheDentaireFormComponent },
  { path: 'dentaire-fiche-auto', component: FicheDentaireAutoComponent },
  { path: 'fiche/:id', component: FicheDetailComponent },
  { path: 'fiche-gestionnaire/:id', component: FicheDetailGestionnaireComponent },
  {path:'mes-fiches',component:EmployesTableComponent},
  {path:'fiches/:id/edit',component:FicheEditComponent},
  {path:'fiches/:id/edit-gestionnaire',component:FicheEditGestionnaireComponent},
  { path: 'prise-en-charge', component: PriseEnChargeTableComponent },
  { path: 'prise-en-charge/create', component: PriseEnChargeFormComponent },
  { path: 'prise-en-charge/:id', component: PriseEnChargeDetailComponent },
  { path: 'prise-en-charge/:id/edit', component: PriseEnChargeFormComponent },
  { path: 'prise-en-charge-gestionnaire', component: PriseEnChargeGestionnaireTableComponent },
  { path: 'prise-en-charge-gestionnaire/:id', component: PriseEnChargeDetailGestionnaireComponent },
  { path: '**', redirectTo: 'login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
