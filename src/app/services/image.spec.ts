import { TestBed } from '@angular/core/testing';

import { Image } from './image.service';

describe('Image', () => {
  let service: Image;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Image);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
