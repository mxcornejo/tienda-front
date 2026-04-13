import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
})
export class LoginComponent {
  form: FormGroup;
  error = '';
  loading = false;
  returnUrl = '/';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    this.form = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/catalogo';
    if (this.authService.isLoggedIn()) this.router.navigate([this.returnUrl]);
  }

  get f() {
    return this.form.controls;
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;
    this.error = '';
    const { username, password } = this.form.value;
    this.authService.login(username, password).subscribe({
      next: () => this.router.navigate([this.returnUrl]),
      error: (err) => {
        this.error = err.message || 'Error al iniciar sesión';
        this.loading = false;
      },
    });
  }
}
