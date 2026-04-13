import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth';
import { HttpClient } from '@angular/common/http';
import { Usuario } from '../../models/models';

function passwordStrength(control: AbstractControl): ValidationErrors | null {
  const v: string = control.value || '';
  if (!v) return null; // optional field
  const errors: ValidationErrors = {};
  if (v.length < 8) errors['minLength'] = true;
  if (v.length > 30) errors['maxLength'] = true;
  if (!/[A-Z]/.test(v)) errors['noUpperCase'] = true;
  if (!/[a-z]/.test(v)) errors['noLowerCase'] = true;
  if (!/[0-9]/.test(v)) errors['noNumber'] = true;
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(v)) errors['noSpecial'] = true;
  return Object.keys(errors).length ? errors : null;
}

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './perfil.html',
  styleUrls: ['./perfil.scss'],
})
export class PerfilComponent implements OnInit {
  form: FormGroup;
  usuario: Usuario | null = null;
  success = '';
  error = '';
  loading = false;

  constructor(
    private fb: FormBuilder,
    public authService: AuthService,
    private http: HttpClient,
  ) {
    this.form = this.fb.group(
      {
        username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
        email: ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
        password: ['', [passwordStrength]],
        confirmarPassword: [''],
      },
      {
        validators: (g: AbstractControl) => {
          const pw = g.get('password')?.value;
          const cpw = g.get('confirmarPassword')?.value;
          if (pw && pw !== cpw) return { mismatch: true };
          return null;
        },
      },
    );
  }

  ngOnInit() {
    this.usuario = this.authService.getUsuario();
    if (this.usuario) {
      this.form.patchValue({ username: this.usuario.username, email: this.usuario.email });
    }
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
    if (!this.usuario?.id) return;
    this.loading = true;
    this.error = '';
    const payload: Partial<Usuario> = {
      username: this.form.value.username,
      email: this.form.value.email,
    };
    if (this.form.value.password) payload['password'] = this.form.value.password;

    this.http
      .put<Usuario>(`http://localhost:8080/api/usuarios/${this.usuario.id}`, payload)
      .subscribe({
        next: (updated) => {
          this.authService.saveSession({ ...this.usuario!, ...updated });
          if (this.form.value.password) {
            // Actualizar credenciales en sesión para que el interceptor use la nueva contraseña
            this.authService.actualizarCredenciales(updated.username, this.form.value.password);
          }
          this.success = 'Perfil actualizado exitosamente.';
          this.loading = false;
        },
        error: () => {
          this.error = 'Error al actualizar el perfil.';
          this.loading = false;
        },
      });
  }
}
