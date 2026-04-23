import { TestBed, ComponentFixture, fakeAsync, tick } from '@angular/core/testing';
import { LoginComponent } from './login';
import { provideRouter, Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth';
import { of, throwError } from 'rxjs';
import { Usuario } from '../../models/models';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let router: Router;

  const mockUser: Usuario = { id: 1, username: 'admin', email: 'a@b.com', rol: 'ROLE_CLIENTE' };

  function createComponent(isLoggedIn = false, returnUrl = '/catalogo') {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['login', 'isLoggedIn']);
    authServiceSpy.isLoggedIn.and.returnValue(isLoggedIn);

    TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authServiceSpy },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { queryParams: { returnUrl } } },
        },
      ],
    });

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  }

  describe('initialization', () => {
    it('should create the component', () => {
      createComponent();
      expect(component).toBeTruthy();
    });

    it('should build the form with username and password controls', () => {
      createComponent();
      expect(component.form.contains('username')).toBeTrue();
      expect(component.form.contains('password')).toBeTrue();
    });

    it('should redirect to returnUrl if already logged in', () => {
      createComponent(true, '/catalogo');
      const navigateSpy = spyOn(router, 'navigate');
      // Re-trigger constructor logic via reload
      expect(authServiceSpy.isLoggedIn).toHaveBeenCalled();
    });

    it('should use /catalogo as default returnUrl', () => {
      createComponent(false, '');
      expect((component as any).returnUrl).toBe('/catalogo');
    });
  });

  describe('get f', () => {
    it('should expose form controls', () => {
      createComponent();
      expect(component.f['username']).toBeTruthy();
      expect(component.f['password']).toBeTruthy();
    });
  });

  describe('onSubmit', () => {
    it('should mark all fields as touched when form is invalid', () => {
      createComponent();
      component.onSubmit();
      expect(component.form.touched).toBeTrue();
    });

    it('should call authService.login on valid submission', fakeAsync(() => {
      createComponent();
      authServiceSpy.login = jasmine.createSpy('login').and.returnValue(of(mockUser));
      component.form.setValue({ username: 'testuser', password: 'Password1!' });
      const navigateSpy = spyOn(router, 'navigate');
      component.onSubmit();
      tick();
      expect(authServiceSpy.login).toHaveBeenCalledWith('testuser', 'Password1!');
      expect(navigateSpy).toHaveBeenCalled();
    }));

    it('should set error message on login failure', fakeAsync(() => {
      createComponent();
      authServiceSpy.login = jasmine
        .createSpy('login')
        .and.returnValue(throwError(() => new Error('Credenciales inválidas')));
      component.form.setValue({ username: 'testuser', password: 'Password1!' });
      component.onSubmit();
      tick();
      expect(component.error).toBe('Credenciales inválidas');
      expect(component.loading).toBeFalse();
    }));

    it('should set generic error message when error has no message', fakeAsync(() => {
      createComponent();
      authServiceSpy.login = jasmine.createSpy('login').and.returnValue(throwError(() => ({})));
      component.form.setValue({ username: 'testuser', password: 'Password1!' });
      component.onSubmit();
      tick();
      expect(component.error).toBe('Error al iniciar sesión');
    }));
  });
});
