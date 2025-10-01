import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';

@Component({
  selector: 'app-order-detail-shared',
  templateUrl: './order-detail-shared.component.html',
  styleUrls: ['./order-detail-shared.component.css']
})
export class OrderDetailSharedComponent implements OnInit {

  @Input() order: any;
  @Input() orderItems: any[] = [];
  @Input() isAdmin: boolean = false;
  @Input() isLoading: boolean = false;
  @Output() goBack = new EventEmitter<void>();
  @Output() printOrder = new EventEmitter<void>();
  @Output() statusChange = new EventEmitter<{orderId: number, action: string}>();

  statusMap: { [key: string]: string } = {
    'PENDING': 'Đang chờ thanh toán VNPay',
    'PAID': 'Đã thanh toán',
    'SHIPPING': 'Đang giao',
    'COMPLETED': 'Giao thành công',
    'CONFIRMED': 'Chờ xác nhận',
    'CANCELLED': 'Đã huỷ'
  };

  ngOnInit(): void {
    console.log('Order detail shared loaded:', {
      order: this.order,
      orderItems: this.orderItems,
      isAdmin: this.isAdmin
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

  getCustomerFullName(): string {
    if (!this.order) return 'Không xác định';
    const firstName = this.order.firstname || '';
    const lastName = this.order.lastname || '';
    return `${firstName} ${lastName}`.trim() || this.order.user?.email || 'Không xác định';
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN') + ' ' + date.toLocaleTimeString('vi-VN');
    } catch (error) {
      return dateString;
    }
  }

  getPaymentDate(): string {
    if (this.order?.payDateTime) {
      return this.order.payDateTime;
    } else if (this.order?.orderStatus === 'PAID') {
      return 'Chưa có thông tin ngày thanh toán';
    } else {
      return 'Chưa thanh toán';
    }
  }

  calculateItemsTotal(): number {
    return this.orderItems.reduce((total, item) => total + (item.subTotal || 0), 0);
  }

  calculateTotalQuantity(): number {
    return this.orderItems.reduce((total, item) => total + (item.quantity || 0), 0);
  }

  isButtonDisabled(orderStatus: string): boolean {
    if (!orderStatus) return true;
    return ['PENDING', 'COMPLETED', 'CANCELLED'].includes(orderStatus);
  }

  onStatusButtonClick(action: string): void {
    if (this.order && this.order.id) {
      this.statusChange.emit({
        orderId: this.order.id,
        action: action
      });
    }
  }

  onGoBack(): void {
    this.goBack.emit();
  }

  onPrintOrder(): void {
    this.printOrder.emit();
  }
}