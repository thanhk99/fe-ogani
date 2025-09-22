import { Component, OnInit } from '@angular/core';
import { faBars, faHeart, faPhone, faShoppingBag } from '@fortawesome/free-solid-svg-icons';
import { MessageService } from 'primeng/api';
import { Order } from 'src/app/_class/order';
import { OrderDetail } from 'src/app/_class/order-detail';

import { CartService } from 'src/app/_service/cart.service';
import { OrderService } from 'src/app/_service/order.service';
import { StorageService } from 'src/app/_service/storage.service';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css'],
  providers: [MessageService]

})
export class CheckoutComponent implements OnInit {
  heart = faHeart;
  bag = faShoppingBag;
  phone = faPhone;
  bars = faBars;
  showDepartment = false;
  order = new Order();
  listOrderDetail: any[] = [];
  username !: string;
  paymentCOD: boolean = false;
  paymentVNPay: boolean = false;
  orderForm: any = {
    firstname: null,
    lastname: null,
    country: null,
    address: null,
    town: null,
    state: null,
    postCode: null,
    email: null,
    phone: null,
    note: null
  }

  constructor(
    public cartService: CartService,
    private orderService: OrderService,
    private storageService: StorageService,
    public messageService: MessageService
  ) {

  }
  ngOnInit(): void {
    this.username = this.storageService.getUser().username;
    this.cartService.getItems();
    console.log(this.username);
  }

  showDepartmentClick() {
    this.showDepartment = !this.showDepartment;
  }

  placeOrder() {
    this.cartService.items.forEach(res => {
      let orderDetail: OrderDetail = new OrderDetail;
      orderDetail.name = res.name;
      orderDetail.price = res.price;
      orderDetail.quantity = res.quantity;
      orderDetail.subTotal = res.subTotal;
      this.listOrderDetail.push(orderDetail);
    })

    const { firstname, lastname, country, address, town, state, postCcode, phone, email, note } = this.orderForm;
    this.orderService.placeOrder(firstname, lastname, country, address, town, state, postCcode, phone, email, note, this.listOrderDetail, this.username).subscribe({
      next: res => {
        if (this.orderForm.firstname == null
          && this.orderForm.lastname == null
          // && this.orderForm.country == null 
          && this.orderForm.address == null
          && this.orderForm.town == null
          // && this.orderForm.state == null 
          // && this.orderForm.postCode == null 
          && this.orderForm.phone == null
          && this.orderForm.email == null ) {
          this.orderForm.firstname = "";
          this.orderForm.lastname = "";
          this.messageService.add({ severity: 'info', summary: 'Ghi chú', detail: "Nhập đầy đủ thông tin!!" });
        }
        else {
          this.cartService.clearCart();
          this.messageService.add({ severity: 'success', summary: 'Thành công', detail: "Đặt hàng thành công!!" });
        }

      }, error: err => {
        console.log(err);
      }
    })

  }


}
