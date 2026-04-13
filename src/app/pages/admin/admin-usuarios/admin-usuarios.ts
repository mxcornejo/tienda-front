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
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../services/auth';
import { Usuario } from '../../../models/models';

function passwordStrength(control: AbstractControl): ValidationErrors | null {
  const v: string = control.value || '';
  if (!v) return null;
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
  selector: 'app-admin-usuarios',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './admin-usuarios.html',
  styleUrls: ['./admin-usuarios.scss'],
})
export class AdminUsuariosComponent implements OnInit {
  private apiUrl = 'http://localhost:8080/api/usuarios';
  usuarios: Usuario[] = [];
  form: FormGroup;
  editando: Usuario | null = null;
  loading = true;
  guardando = false;
  error = '';
  success = '';
  mostrarFormulario = false;
  eliminandoId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private http: HttpClient,
  ) {
    this.form = this.fb.group({
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
      rol: ['ROLE_CLIENTE', [Validators.required]],
    });
  }

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    this.loading = true;
    this.authService.getAllUsuarios().subscribe({
      next: (data) => {
        this.usuarios = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'Error al cargar usuarios.';
        this.loading = false;
      },
    });
  }

  get f() {
    return this.form.controls;
  }
  get pw() {
    return this.form.get('password');
  }

  nuevo() {
    this.editando = null;
    this.form.reset({ rol: 'ROLE_CLIENTE' });
    this.form.get('password')?.setValidators([Validators.required, passwordStrength]);
    this.form.get('password')?.updateValueAndValidity();
    this.mostrarFormulario = true;
    this.error = '';
    this.success = '';
  }

  editar(u: Usuario) {
    this.editando = u;
    this.form.patchValue({ username: u.username, email: u.email, rol: u.rol, password: '' });
    this.form.get('password')?.clearValidators();
    this.form.get('password')?.updateValueAndValidity();
    this.mostrarFormulario = true;
  }

  cancelar() {
    this.mostrarFormulario = false;
    this.editando = null;
    this.form.reset();
  }

  guardar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.guardando = true;
    const payload: Usuario = {
      username: this.form.value.username,
      email: this.form.value.email,
      rol: this.form.value.rol,
      ...(this.form.value.password ? { password: this.form.value.password } : {}),
    };
    const op = this.editando?.id
      ? this.http.put<Usuario>(`${this.apiUrl}/${this.editando.id}`, payload)
      : this.authService.registro(payload);
    op.subscribe({
      next: () => {
        this.success = this.editando ? 'Usuario actualizado.' : 'Usuario creado.';
        this.guardando = false;
        this.mostrarFormulario = false;
        this.editando = null;
        this.cargar();
      },
      error: () => {
        this.error = 'Error al guardar. El usuario o correo ya existe.';
        this.guardando = false;
      },
    });
  }

  eliminar(id: number) {
    if (!confirm('¿Eliminar este usuario?')) return;
    this.eliminandoId = id;
    this.authService.deleteUsuario(id).subscribe({
      next: () => {
        this.eliminandoId = null;
        this.cargar();
      },
      error: () => {
        this.error = 'Error al eliminar.';
        this.eliminandoId = null;
      },
    });
  }
}
