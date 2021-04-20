import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateProfileFailedDialogComponent } from './update-profile-failed-dialog.component';

describe('UpdateProfileFailedDialogComponent', () => {
  let component: UpdateProfileFailedDialogComponent;
  let fixture: ComponentFixture<UpdateProfileFailedDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UpdateProfileFailedDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdateProfileFailedDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
