import { TestBed } from '@angular/core/testing';

import { Item } from '../models/item.model'; 
import { ItemService } from './item.service';

describe('Item', () => {
  let service: ItemService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ItemService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
