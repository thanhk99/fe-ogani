import { Component, OnInit } from '@angular/core';
import { OrderService } from 'src/app/_service/order.service';
import { Router } from '@angular/router';
import { OrderSocketService } from 'src/app/_service/order-socket.service';
import { Subscription } from 'rxjs';
import { Order } from 'src/app/_class/order';



@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.css']
})
export class OrderComponent implements OnInit {

  listOrder: any[] = [];
  private subscriptions: Subscription[] = [];

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
    private router: Router,
    private order: OrderSocketService,
    // private messageService: MessageService
  ) { }

  ngOnInit(): void {
    this.order.connect(); // Kết nối WS khi component init

    // Subscribe thông báo mới (hiển thị toast)
    const notifSub = this.order.getNewOrderNotifications().subscribe((data) => {
      // this.messageService.add({
      //   severity: 'info', // Hoặc 'success' nếu muốn xanh, tùy theo theme
      //   summary: `Order ${data.orderId}`,
      //   detail: data.message
      // });
    });

    // Subscribe update orders (thêm vào list mà không reload)
    const updateSub = this.order.getOrderUpdates().subscribe((newOrder: Order) => {
      this.listOrder = [...this.listOrder, newOrder]; // Add vào array (trigger change detection)
      console.log('New order added:', newOrder);
    });

    this.subscriptions.push(notifSub, updateSub);

    // Load initial orders từ API (nếu cần)
    this.getListOrder();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.order.disconnect();
  }

  getListOrder() {
    this.orderService.getListOrder().subscribe({
      next: res => {
        this.listOrder = res || [];
        console.log('Danh sách đơn hàng:', this.listOrder);
      }, error: err => {
        console.log('Lỗi khi lấy danh sách đơn hàng:', err);
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

  isButtonDisabled(orderStatus: string): boolean {
    if (!orderStatus) return true;
    return ['PENDING', 'COMPLETED', 'CANCELLED'].includes(orderStatus);
  }

  // Kiểm tra xem có thể huỷ đơn hàng không (chỉ cho PENDING)
  canCancelOrder(orderStatus: string): boolean {
    return orderStatus === 'PENDING';
  }

  onStatusButtonClick(order: any, action: string) {
    if (!order || !order.orderStatus) {
      return;
    }

    switch (action) {
      case 'confirm':
        if (!this.isButtonDisabled(order.orderStatus)) {
          this.confirmOrder(order.id);
        }
        break;
      case 'ship':
        if (!this.isButtonDisabled(order.orderStatus)) {
          this.shipOrder(order.id);
        }
        break;
      case 'complete':
        if (!this.isButtonDisabled(order.orderStatus)) {
          this.completeOrder(order.id);
        }
        break;
      case 'cancel':
        if (this.canCancelOrder(order.orderStatus)) {
          this.cancelOrder(order.id);
        }
        break;
      default:
        console.log('Action không xác định');
    }
  }

  confirmOrder(orderId: number) {
    console.log('Xác nhận đơn hàng:', orderId);
    this.orderService.confirmOrder(orderId).subscribe({
      next: res => {
        console.log('Xác nhận thành công');
        this.getListOrder();
      },
      error: err => {
        console.log('Lỗi xác nhận:', err);
      }
    });
  }

  shipOrder(orderId: number) {
    console.log('Bắt đầu giao hàng:', orderId);
    this.orderService.shipOrder(orderId).subscribe({
      next: res => {
        console.log('Bắt đầu giao hàng thành công');
        this.getListOrder();
      },
      error: err => {
        console.log('Lỗi bắt đầu giao hàng:', err);
      }
    });
  }

  completeOrder(orderId: number) {
    console.log('Hoàn thành đơn hàng:', orderId);
    this.orderService.completeOrder(orderId).subscribe({
      next: res => {
        console.log('Hoàn thành đơn hàng thành công');
        this.getListOrder();
      },
      error: err => {
        console.log('Lỗi hoàn thành đơn hàng:', err);
      }
    });
  }

  cancelOrder(orderId: number) {
    console.log('Huỷ đơn hàng:', orderId);
    if (confirm('Bạn có chắc chắn muốn huỷ đơn hàng này?')) {
      this.orderService.cancelOrder(orderId).subscribe({
        next: res => {
          console.log('Huỷ đơn hàng thành công');
          this.getListOrder();
        },
        error: err => {
          console.log('Lỗi huỷ đơn hàng:', err);
        }
      });
    }
  }

  getCustomerFullName(order: any): string {
    if (!order) return 'Không xác định';
    const firstName = order.firstname || '';
    const lastName = order.lastname || '';
    return `${firstName} ${lastName}`.trim() || order.user?.email || 'Không xác định';
  }

  getPaymentDate(order: any): string {
    if (order.payDateTime) {
      return order.payDateTime;
    } else if (order.orderStatus === 'PAID') {
      return 'Chưa có thông tin ngày thanh toán';
    } else {
      return 'Chưa thanh toán';
    }
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN') + ' ' + date.toLocaleTimeString('vi-VN');
    } catch (error) {
      return dateString;
    }
  }

  viewOrderDetail(orderId: number): void {
    this.router.navigate(['/admin/order', orderId]);
  }
}