import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-recuperar-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './recuperar-password.html',
  styleUrls: ['./recuperar-password.scss'],
})
export class RecuperarPasswordComponent {
  form: FormGroup;
  mensaje = '';
  loading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
    });
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
    this.authService.recuperarPassword(this.form.value.email).subscribe({
      next: (res) => {
        this.mensaje = res.mensaje;
        this.loading = false;
      },
      error: () => {
        this.mensaje = 'Ocurrió un error. Inténtalo nuevamente.';
        this.loading = false;
      },
    });
  }
}
