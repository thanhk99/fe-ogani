import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/_service/auth.service';

@Component({
  selector: 'app-forgotpassword',
  templateUrl: './forgotpassword.component.html',
  styleUrls: ['./forgotpassword.component.css']
})
export class ForgotpasswordComponent {

   currentStep: 'email' | 'reset-password' = 'email';
  emailForm: FormGroup;
  passwordForm: FormGroup;
  loading = false;
  errorMessage = '';
  successMessage = '';
  userEmail = '';

  constructor(
    private formBuilder: FormBuilder,
    private router: Router
  ) {
    // Form nhập email
    this.emailForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]]
    });

    // Form đặt lại mật khẩu
    this.passwordForm = this.formBuilder.group({
      matkhau: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  // Password match validator
  passwordMatchValidator(control: AbstractControl) {
    const password = control.get('matkhau')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  // Toggle password visibility
  togglePasswordVisibility(input: HTMLInputElement) {
    const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
    input.setAttribute('type', type);
    
    const eyeIcon = input.parentElement?.querySelector('.eye-icon') as HTMLElement;
    const eyeSlashIcon = input.parentElement?.querySelector('.eye-slash-icon') as HTMLElement;
    
    if (type === 'text') {
      eyeIcon.style.display = 'none';
      eyeSlashIcon.style.display = 'block';
    } else {
      eyeIcon.style.display = 'block';
      eyeSlashIcon.style.display = 'none';
    }
  }

  // Step 1: Submit email form
  onSubmitEmail() {
    if (this.emailForm.valid) {
      this.loading = true;
      this.errorMessage = '';

      // Giả lập API call kiểm tra email
      setTimeout(() => {
        this.loading = false;
        const email = this.emailForm.value.email;
        
        // Giả lập thành công - chuyển sang step đặt mật khẩu
        this.userEmail = email;
        this.currentStep = 'reset-password';
        
      }, 1500);
    } else {
      // Đánh dấu tất cả các trường là đã chạm vào để hiển thị lỗi
      Object.keys(this.emailForm.controls).forEach(key => {
        this.emailForm.get(key)?.markAsTouched();
      });
    }
  }

  // Step 2: Submit password form
  onSubmitPassword() {
    if (this.passwordForm.valid) {
      this.loading = true;
      this.errorMessage = '';
      this.successMessage = '';

      // Giả lập API call đặt lại mật khẩu
      setTimeout(() => {
        this.loading = false;
        const newPassword = this.passwordForm.value.matkhau;
        
        // Giả lập thành công
        this.successMessage = 'Đặt lại mật khẩu thành công! Đang chuyển hướng...';
        
        // Chuyển đến trang login sau 2 giây
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
        
      }, 1500);
    } else {
      // Đánh dấu tất cả các trường là đã chạm vào để hiển thị lỗi
      Object.keys(this.passwordForm.controls).forEach(key => {
        this.passwordForm.get(key)?.markAsTouched();
      });
    }
  }

  // Back to email form
  backToEmail() {
    this.currentStep = 'email';
    this.errorMessage = '';
    this.successMessage = '';
  }

  // Login method
  login() {
    this.router.navigate(['/login']);
  }

}
