import { NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { EmployesTableComponent } from './components/employes-table/employes-table.component';
import { NavbarGestionnaireComponent } from './components/navbar-gestionnaire/navbar-gestionnaire.component';
import { GestionnaireTableComponent } from './components/gestionnaire-table/gestionnaire-table.component';
import { GestionnaireHomeComponent } from './components/gestionnaire-home/gestionnaire-home.component';
import { EmployesHomeComponent } from './components/employes-home/employes-home.component';
import { FicheMedicalFormComponent } from './components/fiche-medical-form/fiche-medical-form.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { FicheDentaireFormComponent } from './components/fiche-dentaire-form/fiche-dentaire-form.component';
import {HTTP_INTERCEPTORS, HttpClient, HttpClientModule, provideHttpClient, withFetch} from '@angular/common/http';
import { LoginComponent } from './components/login/login.component';
import {CommonModule} from '@angular/common';
import { FicheDetailComponent } from './components/fiche-detail/fiche-detail.component';
import {PdfViewerModule} from 'ng2-pdf-viewer';
import {NgxDaterangepickerMd} from 'ngx-daterangepicker-material';
import { FicheDetailGestionnaireComponent } from './components/fiche-detail-gestionnaire/fiche-detail-gestionnaire.component';
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import {NavbarEmployeComponent} from './components/navbar-employe/navbar-employe.component';
import {FicheEditComponent} from './components/fiche-edit/fiche-edit.component';
import { FicheMedicalAutoComponent } from './components/fiche-medical-auto/fiche-medical-auto.component';
import { FicheDentaireAutoComponent } from './components/fiche-dentaire-auto/fiche-dentaire-auto.component';
import { FicheEditGestionnaireComponent } from './components/fiche-edit-gestionnaire/fiche-edit-gestionnaire.component';
import {EmployeeSearchComponent} from './components/newfiche/employee-search.component';
import {PriseEnChargeTableComponent} from './components/prise-en-charge-table/prise-en-charge-table.component';
import {PriseEnChargeFormComponent} from './components/prise-en-charge-form/prise-en-charge-form.component';
import {SafePipe} from './pipes/safe.pipe';
import {PriseEnChargeDetailGestionnaireComponent} from './components/prise-en-charge-detail-gestionnaire/prise-en-charge-detail-gestionnaire.component';
import {PriseEnChargeDetailComponent} from './components/prise-en-charge-detail/prise-en-charge-detail.component';
import {PriseEnChargeGestionnaireTableComponent} from './components/prise-en-charge-gestionnaire-table/prise-en-charge-gestionnaire-table.component';


export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    AppComponent,
    EmployesTableComponent,
    NavbarGestionnaireComponent,
    NavbarEmployeComponent,
    GestionnaireTableComponent,
    GestionnaireHomeComponent,
    EmployesHomeComponent,
    FicheDentaireFormComponent,
    FicheDetailComponent,
    FicheMedicalFormComponent,
    FicheDetailGestionnaireComponent,
    FicheEditComponent,
    FicheMedicalAutoComponent,
    FicheDentaireAutoComponent,
    FicheEditGestionnaireComponent,
    EmployeeSearchComponent,
    SafePipe,
    PriseEnChargeTableComponent,
    PriseEnChargeFormComponent,
    PriseEnChargeDetailGestionnaireComponent,
    PriseEnChargeDetailComponent,
    PriseEnChargeGestionnaireTableComponent


  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    CommonModule,
    HttpClientModule,
    PdfViewerModule,
    NgxDaterangepickerMd.forRoot(),
    TranslateModule.forRoot({
      defaultLanguage: 'en',
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    ReactiveFormsModule,
  ],
  providers: [
    provideClientHydration(withEventReplay())
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
