import { TestBed, ComponentFixture, fakeAsync, tick } from '@angular/core/testing';
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

  describe('guardar – creating new user', () => {
    it('should mark all touched when form is invalid', () => {
      component.nuevo();
      component.form.get('username')!.setValue('');
      component.guardar();
      expect(component.form.touched).toBeTrue();
    });

    it('should call authService.registro when creating a new user', fakeAsync(() => {
      authServiceSpy.registro.and.returnValue(of(mockUsuarios[0]));
      component.nuevo();
      component.form.setValue({
        username: 'newuser',
        email: 'new@new.com',
        password: 'Secure1!ok',
        rol: 'ROLE_CLIENTE',
      });
      component.guardar();
      tick();
      expect(authServiceSpy.registro).toHaveBeenCalled();
      expect(component.success).toContain('creado');
      expect(component.mostrarFormulario).toBeFalse();
    }));

    it('should set error on registro failure', fakeAsync(() => {
      authServiceSpy.registro.and.returnValue(throwError(() => new Error('Conflict')));
      component.nuevo();
      component.form.setValue({
        username: 'newuser',
        email: 'new@new.com',
        password: 'Secure1!ok',
        rol: 'ROLE_CLIENTE',
      });
      component.guardar();
      tick();
      expect(component.error).toContain('Error al guardar');
    }));
  });

  describe('guardar – updating existing user', () => {
    it('should PUT to /api/usuarios/:id when editing', fakeAsync(() => {
      component.editar(mockUsuarios[0]);
      component.form.setValue({
        username: 'adminUpdated',
        email: 'admin@a.com',
        password: '',
        rol: 'ROLE_ADMIN',
      });
      component.guardar();

      const req = httpMock.expectOne('http://localhost:8080/api/usuarios/1');
      expect(req.request.method).toBe('PUT');
      req.flush(mockUsuarios[0]);
      tick();

      expect(component.success).toContain('actualizado');
    }));

    it('should set error on PUT failure', fakeAsync(() => {
      component.editar(mockUsuarios[0]);
      component.form.setValue({
        username: 'adminUpdated',
        email: 'admin@a.com',
        password: '',
        rol: 'ROLE_ADMIN',
      });
      component.guardar();

      const req = httpMock.expectOne('http://localhost:8080/api/usuarios/1');
      req.flush('Error', { status: 500, statusText: 'Server Error' });
      tick();

      expect(component.error).toContain('Error al guardar');
    }));
  });

  describe('eliminar', () => {
    it('should not call deleteUsuario when confirm returns false', () => {
      spyOn(window, 'confirm').and.returnValue(false);
      component.eliminar(1);
      expect(authServiceSpy.deleteUsuario).not.toHaveBeenCalled();
    });

    it('should call deleteUsuario and reload after confirmation', fakeAsync(() => {
      spyOn(window, 'confirm').and.returnValue(true);
      authServiceSpy.deleteUsuario.and.returnValue(of(undefined));
      authServiceSpy.getAllUsuarios.and.returnValue(of([]));
      component.eliminar(1);
      tick();
      expect(authServiceSpy.deleteUsuario).toHaveBeenCalledWith(1);
    }));

    it('should set error on delete failure', fakeAsync(() => {
      spyOn(window, 'confirm').and.returnValue(true);
      authServiceSpy.deleteUsuario.and.returnValue(throwError(() => new Error('Error')));
      component.eliminar(1);
      tick();
      expect(component.error).toBe('Error al eliminar.');
    }));
  });
});
