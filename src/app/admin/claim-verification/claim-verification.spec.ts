import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClaimVerification } from './claim-verification.component';

describe('ClaimVerification', () => {
  let component: ClaimVerification;
  let fixture: ComponentFixture<ClaimVerification>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClaimVerification],
    }).compileComponents();

    fixture = TestBed.createComponent(ClaimVerification);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
