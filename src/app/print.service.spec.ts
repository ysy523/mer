import { TestBed } from '@angular/core/testing';

import { PrintService } from '../services/print/print.service';

describe('PrintService', () => {
  let service: PrintService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PrintService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
