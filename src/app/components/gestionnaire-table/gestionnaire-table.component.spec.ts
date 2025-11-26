import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionnaireTableComponent } from './gestionnaire-table.component';

describe('GestionnaireTableComponent', () => {
  let component: GestionnaireTableComponent;
  let fixture: ComponentFixture<GestionnaireTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GestionnaireTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GestionnaireTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
