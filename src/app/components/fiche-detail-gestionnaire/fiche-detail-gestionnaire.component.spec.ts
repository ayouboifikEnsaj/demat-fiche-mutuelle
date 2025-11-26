import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FicheDetailGestionnaireComponent } from './fiche-detail-gestionnaire.component';

describe('FicheDetailGestionnaireComponent', () => {
  let component: FicheDetailGestionnaireComponent;
  let fixture: ComponentFixture<FicheDetailGestionnaireComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FicheDetailGestionnaireComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FicheDetailGestionnaireComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
