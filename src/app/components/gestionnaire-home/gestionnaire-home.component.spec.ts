import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionnaireHomeComponent } from './gestionnaire-home.component';

describe('GestionnaireHomeComponent', () => {
  let component: GestionnaireHomeComponent;
  let fixture: ComponentFixture<GestionnaireHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GestionnaireHomeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GestionnaireHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
