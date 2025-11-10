import { Component, OnInit, ChangeDetectorRef, AfterContentChecked } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { faBars, faHeart, faRightFromBracket, faUser } from '@fortawesome/free-solid-svg-icons'
import { faShoppingBag } from '@fortawesome/free-solid-svg-icons'
import { faPhone } from '@fortawesome/free-solid-svg-icons'
import { MessageService } from 'primeng/api';
import { filter } from 'rxjs';
import { AuthService } from 'src/app/_service/auth.service';
import { CartService } from 'src/app/_service/cart.service';
import { CategoryService } from 'src/app/_service/category.service';
import { StorageService } from 'src/app/_service/storage.service';
import { WishlistService } from 'src/app/_service/wishlist.service';
import { faKey } from '@fortawesome/free-solid-svg-icons'; // 👈 import icon


@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.css'],
  providers: [MessageService]

})
export class IndexComponent implements OnInit {
  faKey = faKey;
  listItemInCart: any[] = [];
  totalPrice = 0;
  heart = faHeart;
  bag = faShoppingBag;
  phone = faPhone;
  userIcon = faUser;
  logoutIcon = faRightFromBracket;
  bars = faBars;

  showDepartment = false;
  showPassword = false;



  loginForm: any = {
    username: null,
    password: null
  }

  registerForm: any = {
    username: null,
    email: null,
    password: null
  }

  changePasswordForm = {
    email: '',
    currentPassword: '',
    newPassword: ''
  };

  isSuccessful = false;
  isSignUpFailed = false;
  isLoggedIn = false;
  isLoginFailed = false;
  role: string = '';
  errorMessage = '';
  authModal: boolean = false;
  listCategoryEnabled: any;

  loading = false;
  successMessage = '';




  keyword: any;

  constructor(
    public cartService: CartService,
    public wishlistService: WishlistService,
    private authService: AuthService,
    private storageService: StorageService,
    private messageService: MessageService,
    private categoryService: CategoryService,
    private router: Router) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        const navigation = this.router.getCurrentNavigation();
        if (navigation?.extras?.state?.['showLoginModal']) {
          this.authModal = true;
        }
      });

  }

  ngOnInit(): void {
    this.getCategoryEnbled();
    this.isLoggedIn = this.storageService.isLoggedIn();
    this.wishlistService.loadWishList();
    this.cartService.loadCart();
    const currentNavigation = this.router.getCurrentNavigation();
    if (currentNavigation?.extras?.state?.['showLoginModal']) {
      this.authModal = true;
    }
  }

  showDepartmentClick() {
    this.showDepartment = !this.showDepartment;
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  getCategoryEnbled() {
    this.categoryService.getListCategoryEnabled().subscribe({
      next: res => {
        this.listCategoryEnabled = res;
      }, error: err => {
        console.log(err);
      }
    })
  }

  removeFromCart(item: any) {
    this.cartService.remove(item);
  }

  removeWishList(item: any) {
    this.wishlistService.remove(item);
  }

  showAuthForm() {
    if (!this.isLoggedIn) {
      this.authModal = true;
      this.loginForm = { username: null, password: null };
      this.registerForm = { username: null, email: null, password: null };
    }
  }

  login(): void {
    const { username, password } = this.loginForm;
    console.log(this.loginForm);
    this.authService.login(username, password).subscribe({
      next: res => {
        this.storageService.saveUser(res);
        this.isLoggedIn = true;
        this.isLoginFailed = false;
        this.role = this.storageService.getUser().roles;
        console.log(res);
        if (res.role == "ROLE_ADMIN") {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/']);
        }

        this.messageService.add({ severity: 'success', summary: 'Thành công', detail: 'Đăng nhập thành công!' });
        this.authModal = false;

      }, error: err => {
        console.log(err);
        this.isLoggedIn = false;
        this.isLoginFailed = true;
        this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Đăng nhập thất bại! Vui lòng kiểm tra lại thông tin.' });
      }
    })
  }

  forgot(): void {
    this.authModal = false;
    this.router.navigate(["/forgot"])
  }

  changePassword() {
    this.authModal = false;
    this.router.navigate(["/change-password"])
  }

  register(): void {
    const { username, email, password } = this.registerForm;

    if( !password || password.length <6 )
    {
       this.messageService.add({severity: 'warn', summary: 'Cảnh báo', detail: 'Mật khẩu phải có ít nhất 6 ký tự.'});
    }
    this.authService.register(username, email, password).subscribe({
      next: res => {
        this.isSuccessful = true;
        this.isSignUpFailed = false;

        this.messageService.add({
          severity: 'success',
          summary: 'Thành công',
          detail: res.message || 'Đăng ký thành công! Vui lòng đăng nhập.'
        });

        this.authModal = false;
      },
      error: err => {
        this.isSignUpFailed = true;

        // Nếu backend trả về lỗi chi tiết
        const errorMsg =
          err.error?.message ||
          'Đăng ký thất bại! Vui lòng kiểm tra lại thông tin.';

        // Nếu có lỗi cụ thể (email, username, password...)
        if (err.error?.field) {
          this.messageService.add({
            severity: 'warn',
            summary: 'Lỗi xác thực',
            detail: `${err.error.message} (Trường: ${err.error.field})`
          });
        }
        // Nếu lỗi email hoặc username đã tồn tại
        else if (err.status === 409) {
          this.messageService.add({
            severity: 'error',
            summary: 'Trùng lặp',
            detail: errorMsg
          });
        }
        // Lỗi hệ thống
        else if (err.status === 500) {
          this.messageService.add({
            severity: 'error',
            summary: 'Lỗi hệ thống',
            detail: errorMsg
          });
        }
        // Các lỗi khác
        else {
          this.messageService.add({
            severity: 'error',
            summary: 'Lỗi',
            detail: errorMsg
          });
        }

        this.errorMessage = errorMsg;
      }
    });
  }


  logout(): void {
    this.authService.logout().subscribe({
      next: res => {
        this.cartService.clearCart();
        this.storageService.clean();
        this.wishlistService.clearCart();
        this.isLoggedIn = false;
        this.authModal = false;
        this.messageService.add({ severity: 'success', summary: 'Thành công', detail: 'Đăng xuất thành công!' });
        this.router.navigate(['/']);

      }, error: err => {
        this.showError(err.message);
      }
    })
  }




  showSuccess(text: string) {
    this.messageService.add({ severity: 'success', summary: 'Success', detail: text });
  }
  showError(text: string) {
    this.messageService.add({ severity: 'error', summary: 'Error', detail: text });
  }

  showWarn(text: string) {
    this.messageService.add({ severity: 'warn', summary: 'Warn', detail: text });
  }

  gotoHome() {
    this.router.navigate(['/']);
  }

  gotoshop() {
    this.router.navigate(['/shop']);
  }
  gotocart() {
    this.router.navigate(['/cart']);
  }
  gotoBlog() {
    this.router.navigate(['/blog']);
  }
  gotoCheckout() {
    this.router.navigate(['/checkout']);
  }


}
