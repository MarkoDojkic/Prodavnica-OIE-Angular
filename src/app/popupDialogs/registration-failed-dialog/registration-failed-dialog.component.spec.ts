import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistrationFailedDialogComponent } from './registration-failed-dialog.component';

describe('RegistrationFailedDialogComponent', () => {
  let component: RegistrationFailedDialogComponent;
  let fixture: ComponentFixture<RegistrationFailedDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RegistrationFailedDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RegistrationFailedDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
