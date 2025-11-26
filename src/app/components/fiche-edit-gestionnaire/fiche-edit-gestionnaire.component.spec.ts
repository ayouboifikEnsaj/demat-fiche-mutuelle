import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FicheEditGestionnaireComponent } from './fiche-edit-gestionnaire.component';

describe('FicheEditGestionnaireComponent', () => {
  let component: FicheEditGestionnaireComponent;
  let fixture: ComponentFixture<FicheEditGestionnaireComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FicheEditGestionnaireComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FicheEditGestionnaireComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
