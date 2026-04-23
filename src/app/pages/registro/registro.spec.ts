import { TestBed, ComponentFixture, fakeAsync, tick } from '@angular/core/testing';
import { RegistroComponent } from './registro';
import { provideRouter, Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { of, throwError } from 'rxjs';
import { Usuario } from '../../models/models';

describe('RegistroComponent', () => {
  let component: RegistroComponent;
  let fixture: ComponentFixture<RegistroComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let router: Router;

  const validUser: Usuario = {
    username: 'newuser',
    email: 'new@email.com',
    password: 'Secure1!',
    rol: 'ROLE_CLIENTE',
  };

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['registro']);

    await TestBed.configureTestingModule({
      imports: [RegistroComponent],
      providers: [provideRouter([]), { provide: AuthService, useValue: authServiceSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(RegistroComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have an invalid form when empty', () => {
    expect(component.form.invalid).toBeTrue();
  });

  describe('get f / get pw', () => {
    it('should expose form controls via f', () => {
      expect(component.f['username']).toBeTruthy();
      expect(component.f['email']).toBeTruthy();
    });

    it('should expose password control via pw', () => {
      expect(component.pw).toBeTruthy();
    });
  });

  describe('password validation', () => {
    const setPassword = (pw: string) => {
      component.form.get('password')!.setValue(pw);
      component.form.get('password')!.markAsTouched();
    };

    it('should fail if shorter than 8 characters', () => {
      setPassword('Ab1!');
      expect(component.pw?.errors?.['minLength']).toBeTrue();
    });

    it('should fail without uppercase letter', () => {
      setPassword('secure1!lllll');
      expect(component.pw?.errors?.['noUpperCase']).toBeTrue();
    });

    it('should fail without lowercase letter', () => {
      setPassword('SECURE1!LLLLL');
      expect(component.pw?.errors?.['noLowerCase']).toBeTrue();
    });

    it('should fail without a number', () => {
      setPassword('Securellll!');
      expect(component.pw?.errors?.['noNumber']).toBeTrue();
    });

    it('should fail without a special character', () => {
      setPassword('SecurePass1');
      expect(component.pw?.errors?.['noSpecial']).toBeTrue();
    });

    it('should pass with a strong password', () => {
      setPassword('Secure1!ok');
      expect(component.pw?.errors).toBeNull();
    });
  });

  describe('passwords match validator', () => {
    it('should set mismatch error when passwords do not match', () => {
      component.form.setValue({
        username: 'user1',
        email: 'u@u.com',
        password: 'Secure1!ok',
        confirmarPassword: 'Different1!',
      });
      expect(component.form.errors?.['mismatch']).toBeTrue();
    });

    it('should be valid when passwords match', () => {
      component.form.setValue({
        username: 'user1',
        email: 'u@u.com',
        password: 'Secure1!ok',
        confirmarPassword: 'Secure1!ok',
      });
      expect(component.form.errors).toBeNull();
    });
  });

  describe('onSubmit', () => {
    it('should mark all touched when form is invalid', () => {
      component.onSubmit();
      expect(component.form.touched).toBeTrue();
    });

    it('should call authService.registro on valid form', fakeAsync(() => {
      authServiceSpy.registro.and.returnValue(of(validUser));
      component.form.setValue({
        username: 'newuser',
        email: 'new@email.com',
        password: 'Secure1!ok',
        confirmarPassword: 'Secure1!ok',
      });
      const navigateSpy = spyOn(router, 'navigate');
      component.onSubmit();
      expect(authServiceSpy.registro).toHaveBeenCalled();
      expect(component.success).toContain('exitosamente');
      tick(2001);
      expect(navigateSpy).toHaveBeenCalledWith(['/login']);
    }));

    it('should set error message on registration failure', fakeAsync(() => {
      authServiceSpy.registro.and.returnValue(throwError(() => new Error('Conflict')));
      component.form.setValue({
        username: 'newuser',
        email: 'new@email.com',
        password: 'Secure1!ok',
        confirmarPassword: 'Secure1!ok',
      });
      component.onSubmit();
      tick();
      expect(component.error).toContain('Error al registrar');
      expect(component.loading).toBeFalse();
    }));
  });
});
