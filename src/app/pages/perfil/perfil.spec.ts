import { TestBed, ComponentFixture, fakeAsync, tick } from '@angular/core/testing';
import { PerfilComponent } from './perfil';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from '../../services/auth';
import { Usuario } from '../../models/models';

describe('PerfilComponent', () => {
  let component: PerfilComponent;
  let fixture: ComponentFixture<PerfilComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let httpMock: HttpTestingController;

  const mockUsuario: Usuario = {
    id: 1,
    username: 'testuser',
    email: 'test@test.com',
    rol: 'ROLE_CLIENTE',
  };

  function setup(usuario: Usuario | null = mockUsuario) {
    authServiceSpy = jasmine.createSpyObj('AuthService', [
      'getUsuario',
      'saveSession',
      'actualizarCredenciales',
    ]);
    authServiceSpy.getUsuario.and.returnValue(usuario);

    TestBed.configureTestingModule({
      imports: [PerfilComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: authServiceSpy },
      ],
    });
  }

  describe('with logged-in user', () => {
    beforeEach(async () => {
      setup();
      await TestBed.compileComponents();
      fixture = TestBed.createComponent(PerfilComponent);
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

    it('should patch form with usuario values on init', () => {
      expect(component.form.value.username).toBe('testuser');
      expect(component.form.value.email).toBe('test@test.com');
    });

    it('should expose form controls via f', () => {
      expect(component.f['username']).toBeTruthy();
      expect(component.f['email']).toBeTruthy();
    });

    it('should expose password control via pw', () => {
      expect(component.pw).toBeTruthy();
    });

    it('should mark form as touched when submitted with invalid data', () => {
      component.form.get('username')!.setValue('');
      component.onSubmit();
      expect(component.form.touched).toBeTrue();
    });

    it('should PUT to /api/usuarios/:id on valid submit without new password', fakeAsync(() => {
      component.form.setValue({
        username: 'testuser',
        email: 'test@test.com',
        password: '',
        confirmarPassword: '',
      });
      component.onSubmit();

      const req = httpMock.expectOne('http://localhost:8080/api/usuarios/1');
      expect(req.request.method).toBe('PUT');
      req.flush({ ...mockUsuario, username: 'testuser' });
      tick();

      expect(authServiceSpy.saveSession).toHaveBeenCalled();
      expect(component.success).toContain('exitosamente');
      expect(component.loading).toBeFalse();
    }));

    it('should update credentials when new password provided', fakeAsync(() => {
      component.form.setValue({
        username: 'testuser',
        email: 'test@test.com',
        password: 'NewPass1!',
        confirmarPassword: 'NewPass1!',
      });
      component.onSubmit();

      const req = httpMock.expectOne('http://localhost:8080/api/usuarios/1');
      req.flush({ ...mockUsuario, username: 'testuser' });
      tick();

      expect(authServiceSpy.actualizarCredenciales).toHaveBeenCalledWith('testuser', 'NewPass1!');
    }));

    it('should set error on PUT failure', fakeAsync(() => {
      component.form.setValue({
        username: 'testuser',
        email: 'test@test.com',
        password: '',
        confirmarPassword: '',
      });
      component.onSubmit();

      const req = httpMock.expectOne('http://localhost:8080/api/usuarios/1');
      req.flush('Error', { status: 500, statusText: 'Server Error' });
      tick();

      expect(component.error).toContain('Error al actualizar');
      expect(component.loading).toBeFalse();
    }));
  });

  describe('with no user', () => {
    beforeEach(async () => {
      setup(null);
      await TestBed.compileComponents();
      fixture = TestBed.createComponent(PerfilComponent);
      component = fixture.componentInstance;
      httpMock = TestBed.inject(HttpTestingController);
      fixture.detectChanges();
    });

    afterEach(() => {
      httpMock.verify();
    });

    it('should not throw when no user is in session', () => {
      expect(component).toBeTruthy();
      expect(component.usuario).toBeNull();
    });

    it('should return early on submit if no usuario id', () => {
      component.form.setValue({
        username: 'user',
        email: 'u@u.com',
        password: '',
        confirmarPassword: '',
      });
      component.onSubmit();
      httpMock.expectNone('http://localhost:8080/api/usuarios/undefined');
    });
  });
});
