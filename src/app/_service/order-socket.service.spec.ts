import { TestBed } from '@angular/core/testing';

import { OrderSocketService } from './order-socket.service';

describe('OrderSocketService', () => {
  let service: OrderSocketService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OrderSocketService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
