import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserVerifyOtpComponent } from './user-verify-otp';

describe('UserVerifyOtpComponent', () => {
  let component: UserVerifyOtpComponent;
  let fixture: ComponentFixture<UserVerifyOtpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserVerifyOtpComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(UserVerifyOtpComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
