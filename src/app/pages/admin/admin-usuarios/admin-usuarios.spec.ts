import { TestBed, ComponentFixture } from '@angular/core/testing';
import { AdminUsuariosComponent } from './admin-usuarios';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from '../../../services/auth';
import { of, throwError } from 'rxjs';
import { Usuario } from '../../../models/models';

describe('AdminUsuariosComponent', () => {
  let component: AdminUsuariosComponent;
  let fixture: ComponentFixture<AdminUsuariosComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let httpMock: HttpTestingController;

  const mockUsuarios: Usuario[] = [
    { id: 1, username: 'admin', email: 'admin@a.com', rol: 'ROLE_ADMIN' },
    { id: 2, username: 'user1', email: 'user1@u.com', rol: 'ROLE_CLIENTE' },
  ];

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', [
      'getAllUsuarios',
      'deleteUsuario',
      'registro',
    ]);
    authServiceSpy.getAllUsuarios.and.returnValue(of(mockUsuarios));

    await TestBed.configureTestingModule({
      imports: [AdminUsuariosComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: authServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminUsuariosComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('cargar', () => {
    it('should load usuarios on init', () => {
      expect(component.usuarios).toEqual(mockUsuarios);
      expect(component.loading).toBeFalse();
    });

    it('should set error when loading fails', () => {
      authServiceSpy.getAllUsuarios.and.returnValue(throwError(() => new Error('Error')));
      component.cargar();
      expect(component.error).toBe('Error al cargar usuarios.');
      expect(component.loading).toBeFalse();
    });
  });

  describe('get f / get pw', () => {
    it('should expose form controls', () => {
      expect(component.f['username']).toBeTruthy();
      expect(component.pw).toBeTruthy();
    });
  });

  describe('nuevo', () => {
    it('should reset form with ROLE_CLIENTE and show form', () => {
      component.nuevo();
      expect(component.mostrarFormulario).toBeTrue();
      expect(component.editando).toBeNull();
      expect(component.form.value.rol).toBe('ROLE_CLIENTE');
    });

    it('should set password as required for new user', () => {
      component.nuevo();
      component.form.get('password')?.setValue('');
      expect(component.form.get('password')?.invalid).toBeTrue();
    });
  });

  describe('editar', () => {
    it('should patch form with usuario values', () => {
      component.editar(mockUsuarios[0]);
      expect(component.editando).toEqual(mockUsuarios[0]);
      expect(component.form.value.username).toBe('admin');
      expect(component.mostrarFormulario).toBeTrue();
    });

    it('should clear password validators when editing', () => {
      component.editar(mockUsuarios[0]);
      expect(component.form.get('password')?.validator).toBeNull();
    });
  });

  describe('cancelar', () => {
    it('should hide form and clear state', () => {
      component.nuevo();
      component.cancelar();
      expect(component.mostrarFormulario).toBeFalse();
      expect(component.editando).toBeNull();
    });
  });

  describe('togglePassword', () => {
    it('should toggle showPassword', () => {
      expect(component.showPassword).toBeFalse();
      component.togglePassword();
      expect(component.showPassword).toBeTrue();
      component.togglePassword();
      expect(component.showPassword).toBeFalse();
    });
  });

  describe('guardar – invalid form', () => {
    it('should mark all touched when form is invalid', () => {
      component.nuevo();
      component.guardar();
      expect(component.form.touched).toBeTrue();
    });
  });

  describe('guardar – creating new user', () => {
    it('should call authService.registro and reload on success', () => {
      authServiceSpy.registro.and.returnValue(
        of({ id: 3, username: 'newuser', email: 'n@n.com', rol: 'ROLE_CLIENTE' }),
      );
      component.nuevo();
      component.form.setValue({
        username: 'newuser',
        email: 'n@n.com',
        password: 'StrongPass1!',
        rol: 'ROLE_CLIENTE',
      });
      component.guardar();
      expect(authServiceSpy.registro).toHaveBeenCalled();
      expect(component.success).toBe('Usuario creado.');
      expect(component.mostrarFormulario).toBeFalse();
    });

    it('should set error when registro fails', () => {
      authServiceSpy.registro.and.returnValue(throwError(() => new Error('Conflict')));
      component.nuevo();
      component.form.setValue({
        username: 'newuser',
        email: 'n@n.com',
        password: 'StrongPass1!',
        rol: 'ROLE_CLIENTE',
      });
      component.guardar();
      expect(component.error).toBe('Error al guardar. El usuario o correo ya existe.');
      expect(component.guardando).toBeFalse();
    });
  });

  describe('guardar – updating existing user', () => {
    it('should PUT to api and show updated message', () => {
      component.editar(mockUsuarios[0]);
      component.form.patchValue({ username: 'adminEdit', email: 'a@a.com' });
      component.guardar();

      const req = httpMock.expectOne('http://localhost:8080/api/usuarios/1');
      expect(req.request.method).toBe('PUT');
      req.flush({ id: 1, username: 'adminEdit', email: 'a@a.com', rol: 'ROLE_ADMIN' });

      expect(component.success).toBe('Usuario actualizado.');
      expect(component.mostrarFormulario).toBeFalse();
    });

    it('should set error when PUT fails', () => {
      component.editar(mockUsuarios[0]);
      component.form.patchValue({ username: 'adminEdit', email: 'a@a.com' });
      component.guardar();

      const req = httpMock.expectOne('http://localhost:8080/api/usuarios/1');
      req.flush('Error', { status: 409, statusText: 'Conflict' });

      expect(component.error).toBe('Error al guardar. El usuario o correo ya existe.');
      expect(component.guardando).toBeFalse();
    });
  });

  describe('eliminar', () => {
    it('should not call deleteUsuario when confirm returns false', () => {
      spyOn(window, 'confirm').and.returnValue(false);
      component.eliminar(1);
      expect(authServiceSpy.deleteUsuario).not.toHaveBeenCalled();
    });

    it('should call deleteUsuario and reload on confirm', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      authServiceSpy.deleteUsuario.and.returnValue(of(undefined));
      component.eliminar(1);
      expect(authServiceSpy.deleteUsuario).toHaveBeenCalledWith(1);
      expect(component.eliminandoId).toBeNull();
    });

    it('should set error when deleteUsuario fails', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      authServiceSpy.deleteUsuario.and.returnValue(throwError(() => new Error('Error')));
      component.eliminar(1);
      expect(component.error).toBe('Error al eliminar.');
      expect(component.eliminandoId).toBeNull();
    });
  });

  describe('passwordStrength validator (via form)', () => {
    const setPw = (pw: string) => {
      component.nuevo(); // resets and adds required+passwordStrength validators
      component.form.get('password')!.setValue(pw);
      component.form.get('password')!.markAsTouched();
    };

    it('should fail if password shorter than 8 chars', () => {
      setPw('Ab1!');
      expect(component.pw?.errors?.['minLength']).toBeTrue();
    });

    it('should fail if password longer than 30 chars', () => {
      setPw('Aa1!aaaaaaaaaaaaaaaaaaaaaaaaaaa'); // 31 chars
      expect(component.pw?.errors?.['maxLength']).toBeTrue();
    });

    it('should fail without uppercase letter', () => {
      setPw('secure1!lllll');
      expect(component.pw?.errors?.['noUpperCase']).toBeTrue();
    });

    it('should fail without lowercase letter', () => {
      setPw('SECURE1!LLLLL');
      expect(component.pw?.errors?.['noLowerCase']).toBeTrue();
    });

    it('should fail without a number', () => {
      setPw('Securellll!');
      expect(component.pw?.errors?.['noNumber']).toBeTrue();
    });

    it('should fail without a special character', () => {
      setPw('SecurePass1');
      expect(component.pw?.errors?.['noSpecial']).toBeTrue();
    });

    it('should pass with a strong password', () => {
      setPw('StrongPass1!');
      expect(component.pw?.errors).toBeNull();
    });
  });
});
