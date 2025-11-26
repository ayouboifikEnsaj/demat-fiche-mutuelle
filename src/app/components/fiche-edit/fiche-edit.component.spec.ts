import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FicheEditComponent } from './fiche-edit.component';

describe('FicheEditComponent', () => {
  let component: FicheEditComponent;
  let fixture: ComponentFixture<FicheEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FicheEditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FicheEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
