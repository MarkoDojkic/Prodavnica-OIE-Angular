import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateProfileSuccessDialogComponent } from './update-profile-success-dialog.component';

describe('UpdateProfileSuccessDialogComponent', () => {
  let component: UpdateProfileSuccessDialogComponent;
  let fixture: ComponentFixture<UpdateProfileSuccessDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UpdateProfileSuccessDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdateProfileSuccessDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
