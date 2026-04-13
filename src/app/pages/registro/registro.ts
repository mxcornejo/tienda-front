import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth';

// Custom validator: password strength
function passwordStrength(control: AbstractControl): ValidationErrors | null {
  const v: string = control.value || '';
  const errors: ValidationErrors = {};
  if (v.length < 8) errors['minLength'] = true;
  if (v.length > 30) errors['maxLength'] = true;
  if (!/[A-Z]/.test(v)) errors['noUpperCase'] = true;
  if (!/[a-z]/.test(v)) errors['noLowerCase'] = true;
  if (!/[0-9]/.test(v)) errors['noNumber'] = true;
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(v)) errors['noSpecial'] = true;
  return Object.keys(errors).length ? errors : null;
}

function passwordsMatch(g: AbstractControl): ValidationErrors | null {
  return g.get('password')?.value === g.get('confirmarPassword')?.value ? null : { mismatch: true };
}

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './registro.html',
  styleUrls: ['./registro.scss'],
})
export class RegistroComponent {
  form: FormGroup;
  error = '';
  success = '';
  loading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
  ) {
    this.form = this.fb.group(
      {
        username: [
          '',
          [
            Validators.required,
            Validators.minLength(3),
            Validators.maxLength(100),
            Validators.pattern('^[a-zA-Z0-9_]+$'),
          ],
        ],
        email: ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
        password: ['', [Validators.required, passwordStrength]],
        confirmarPassword: ['', Validators.required],
      },
      { validators: passwordsMatch },
    );
  }

  get f() {
    return this.form.controls;
  }
  get pw() {
    return this.form.get('password');
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;
    this.error = '';
    const { username, email, password } = this.form.value;
    this.authService.registro({ username, email, password, rol: 'ROLE_CLIENTE' }).subscribe({
      next: () => {
        this.success = '¡Cuenta creada exitosamente! Redirigiendo...';
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: () => {
        this.error = 'Error al registrar. El usuario o correo ya existe.';
        this.loading = false;
      },
    });
  }
}
