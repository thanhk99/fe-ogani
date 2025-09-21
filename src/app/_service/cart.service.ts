import { HttpClient } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import { InputText } from 'primeng/inputtext';
import { Observable, of, Subject } from 'rxjs';

const ORDER_API = "http://localhost:8080/api/order/";
@Injectable({
  providedIn: 'root'
})
export class CartService {

  items : any[] =[];
  
  totalPrice =0;

  total = 0;

  constructor(
    private http: HttpClient
  ) { }



  saveCart():void{
    localStorage.setItem('cart_items',JSON.stringify(this.items));
  }

  addToCart(item: any,quantity: number){
    this.loadCart();
    if(!this.productInCart(item)){
      item.quantity = quantity;
      item.subTotal = item.quantity * item.price;
      this.items.push(item)
    }else{
      this.items.forEach(res => {
        if(res.id == item.id){
          res.quantity += quantity;
          res.subTotal = res.quantity * res.price;
        }
      });
    }
    item.quantity = quantity;
    this.saveCart();
    this.getTotalPrice();

  }


  updateCart(item:any,quantity: number){
    this.items.forEach(res =>{
      if(res.id == item.id){
        res.quantity = quantity;
        res.subTotal = res.quantity * res.price;
      }
    })
    this.saveCart();
    this.getTotalPrice();
  }
  

  productInCart(item: any):boolean{
    return this.items.findIndex((x:any) => x.id == item.id) > -1;
  }
  loadCart():void{
    this.items = JSON.parse(localStorage.getItem('cart_items') as any) || [];
    this.getTotalPrice();

  }

  getItems() {
    return this.items;
    this.getTotalPrice();
  }



  getTotalPrice(){
    this.totalPrice = 0;
    this.total = 0;
    this.items.forEach(res =>{
      this.totalPrice += res.subTotal;
      this.total = this.totalPrice;
    })
    return this.totalPrice;
  }

  remove(item: any){
    const index = this.items.findIndex((o:any) => o.id == item.id);
    if(index > -1){
      this.items.splice(index,1);
      this.saveCart();
    }
    this.getTotalPrice();
  }

  clearCart(){
    this.items = [];
    this.getTotalPrice();
    localStorage.removeItem('cart_items');
  }

  getInfoCart(): Observable<any[]>{
    this.loadCart();
    return of(this.items);
  }
  checkoutOrder(){
    // Gửi thông tin cart đến backend để xử lý đơn hàng
    // api/order/check
    this.getInfoCart();
    // chuyển đổi items sang định dạng phù hợp nếu cần
    const orderItems = this.items.map(item => ({
      productId: item.id,
      quantity: item.quantity,
    }));
    console.log(orderItems);
    return this.http.post(ORDER_API + 'check', {items: orderItems}).subscribe(
      response => {
        console.log('Order placed successfully', response);
        // Xử lý phản hồi từ backend nếu cần
      },
      error => {
        console.error('Error placing order', error);
        // Xử lý lỗi nếu cần
      }
    );

  }
}
