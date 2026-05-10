import { TestBed, ComponentFixture } from '@angular/core/testing';
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

    it('should toggle showPassword', () => {
      expect(component.showPassword).toBeFalse();
      component.togglePassword();
      expect(component.showPassword).toBeTrue();
      component.togglePassword();
      expect(component.showPassword).toBeFalse();
    });

    it('should toggle showConfirmPassword', () => {
      expect(component.showConfirmPassword).toBeFalse();
      component.toggleConfirmPassword();
      expect(component.showConfirmPassword).toBeTrue();
      component.toggleConfirmPassword();
      expect(component.showConfirmPassword).toBeFalse();
    });

    it('should mark form touched and not send request when form is invalid', () => {
      component.form.patchValue({ username: '', email: '' });
      component.onSubmit();
      httpMock.expectNone('http://localhost:8080/api/usuarios/1');
      expect(component.loading).toBeFalse();
    });

    it('should submit and update profile without password change', () => {
      component.form.patchValue({
        username: 'newuser',
        email: 'new@test.com',
        password: '',
        confirmarPassword: '',
      });
      component.onSubmit();

      const req = httpMock.expectOne('http://localhost:8080/api/usuarios/1');
      expect(req.request.method).toBe('PUT');
      const updated: Usuario = {
        id: 1,
        username: 'newuser',
        email: 'new@test.com',
        rol: 'ROLE_CLIENTE',
      };
      req.flush(updated);

      expect(authServiceSpy.saveSession).toHaveBeenCalled();
      expect(authServiceSpy.actualizarCredenciales).not.toHaveBeenCalled();
      expect(component.success).toBe('Perfil actualizado exitosamente.');
      expect(component.loading).toBeFalse();
    });

    it('should submit and update credentials when password is provided', () => {
      component.form.patchValue({
        username: 'newuser',
        email: 'new@test.com',
        password: 'StrongPass1!',
        confirmarPassword: 'StrongPass1!',
      });
      component.onSubmit();

      const req = httpMock.expectOne('http://localhost:8080/api/usuarios/1');
      const updated: Usuario = {
        id: 1,
        username: 'newuser',
        email: 'new@test.com',
        rol: 'ROLE_CLIENTE',
      };
      req.flush(updated);

      expect(authServiceSpy.actualizarCredenciales).toHaveBeenCalledWith('newuser', 'StrongPass1!');
      expect(component.success).toBe('Perfil actualizado exitosamente.');
    });

    it('should set error message on HTTP error', () => {
      component.form.patchValue({
        username: 'newuser',
        email: 'new@test.com',
        password: '',
        confirmarPassword: '',
      });
      component.onSubmit();

      const req = httpMock.expectOne('http://localhost:8080/api/usuarios/1');
      req.flush('Error', { status: 500, statusText: 'Server Error' });

      expect(component.error).toBe('Error al actualizar el perfil.');
      expect(component.loading).toBeFalse();
    });

    describe('passwordStrength validator', () => {
      const setPw = (pw: string) => {
        component.form.get('password')!.setValue(pw);
        component.form.get('password')!.markAsTouched();
      };

      it('should return null for empty password (optional)', () => {
        setPw('');
        expect(component.pw?.errors).toBeNull();
      });

      it('should fail if shorter than 8 characters', () => {
        setPw('Ab1!');
        expect(component.pw?.errors?.['minLength']).toBeTrue();
      });

      it('should fail if longer than 30 characters', () => {
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

    describe('form group mismatch validator', () => {
      it('should return mismatch error when passwords do not match', () => {
        component.form.patchValue({ password: 'StrongPass1!', confirmarPassword: 'Different1!' });
        expect(component.form.errors?.['mismatch']).toBeTrue();
      });

      it('should return null when password is empty', () => {
        component.form.patchValue({ password: '', confirmarPassword: '' });
        expect(component.form.errors).toBeNull();
      });
    });
  });

  describe('without logged-in user', () => {
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

    it('should not patch form when usuario is null', () => {
      expect(component.form.value.username).toBe('');
      expect(component.form.value.email).toBe('');
    });

    it('should not submit when usuario has no id', () => {
      component.form.patchValue({ username: 'someone', email: 'a@b.com' });
      component.onSubmit();
      httpMock.expectNone('http://localhost:8080/api/usuarios/undefined');
      expect(component.loading).toBeFalse();
    });
  });
});
