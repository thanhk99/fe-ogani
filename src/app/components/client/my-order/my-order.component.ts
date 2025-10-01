import { Component, OnInit } from '@angular/core';
import { OrderService } from 'src/app/_service/order.service';
import { StorageService } from 'src/app/_service/storage.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-my-order',
  templateUrl: './my-order.component.html',
  styleUrls: ['./my-order.component.css']
})
export class MyOrderComponent implements OnInit {

  listOrder: any[] = [];
  username: any;
  statusMap: { [key: string]: string } = {
    'PENDING': 'Đang chờ thanh toán VNPay',
    'PAID': 'Đã thanh toán',
    'SHIPPING': 'Đang giao',
    'COMPLETED': 'Giao thành công',
    'CONFIRMED': 'Chờ xác nhận',
    'CANCELLED': 'Đã huỷ'
  };

  constructor(
    private orderService: OrderService,
    private storageService: StorageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.username = this.storageService.getUser().username;
    this.getListOrder();
  }

  getListOrder() {
    this.orderService.getListOrderByUser(this.username).subscribe({
      next: res => {
        this.listOrder = res;
        console.log(this.listOrder);
      }, error: err => {
        console.log(err);
      }
    });
  }

  getStatusText(orderStatus: string): string {
    if (!orderStatus) return 'Không xác định';
    return this.statusMap[orderStatus] || orderStatus;
  }

  getStatusClass(orderStatus: string): string {
    if (!orderStatus) return 'status-unknown';
    return 'status-' + orderStatus.toLowerCase();
  }

  viewOrderDetail(orderId: number): void {
    this.router.navigate(['/order', orderId]);
  }

  getCustomerFullName(order: any): string {
    if (!order) return 'Không xác định';
    const firstName = order.firstname || '';
    const lastName = order.lastname || '';
    return `${firstName} ${lastName}`.trim();
  }

  getProductNames(order: any): string {
    if (!order.orderItems || order.orderItems.length === 0) return 'Không có sản phẩm';
    
    const productNames = order.orderItems.map((item: any) => 
      `${item.product?.name || item.name} (x${item.quantity})`
    );
    return productNames.join(', ');
  }
}