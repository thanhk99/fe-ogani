// src/app/payment-result/payment-result.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PaymentService } from 'src/app/_service/payment.service';

@Component({
  selector: 'app-payment-result',
  templateUrl: './payment-result.component.html',
  styleUrls: ['./payment-result.component.css']
})
export class PaymentResultComponent implements OnInit {
  paymentStatus: string = 'processing';
  message: string = 'Đang xử lý kết quả thanh toán...';
  transactionId: string = '';
  amount: string = '';
  orderInfo: string = '';
  isLoading: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private paymentService: PaymentService
  ) {}

  ngOnInit(): void {
    this.handlePaymentResult();
  }

  handlePaymentResult(): void {
    this.route.queryParams.subscribe({
      next: (params) => {
        const queryString = new URLSearchParams(params).toString();
        console.log('Payment callback params:', queryString);
        if (Object.keys(queryString).length === 0) {
          this.paymentStatus = 'error';
          this.message = 'Không có thông tin thanh toán';
          this.isLoading = false;
          return;
        }
        this.paymentStatus = 'success';
        this.message = 'Thanh toán thành công';
        this.isLoading=false;
        this.paymentService.handlePaymentCallback(queryString).subscribe()
      }
    });

  }

  formatAmount(amount: string): string {
    if (!amount) return '0';
    return new Intl.NumberFormat('vi-VN').format(parseInt(amount));
  }

  backToHome(): void {
    this.router.navigate(['/']);
  }

  tryAgain(): void {
    this.router.navigate(['/payment']);
  }
  printReceipt(): void {
    window.print();
  }
}