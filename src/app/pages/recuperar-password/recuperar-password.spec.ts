import { TestBed, ComponentFixture, fakeAsync, tick } from '@angular/core/testing';
import { RecuperarPasswordComponent } from './recuperar-password';
import { provideRouter } from '@angular/router';
import { AuthService } from '../../services/auth';
import { of, throwError } from 'rxjs';

describe('RecuperarPasswordComponent', () => {
  let component: RecuperarPasswordComponent;
  let fixture: ComponentFixture<RecuperarPasswordComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['recuperarPassword']);

    await TestBed.configureTestingModule({
      imports: [RecuperarPasswordComponent],
      providers: [provideRouter([]), { provide: AuthService, useValue: authServiceSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(RecuperarPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have an invalid form when empty', () => {
    expect(component.form.invalid).toBeTrue();
  });

  describe('get f', () => {
    it('should expose email control', () => {
      expect(component.f['email']).toBeTruthy();
    });
  });

  describe('onSubmit', () => {
    it('should mark form touched when invalid', () => {
      component.onSubmit();
      expect(component.form.touched).toBeTrue();
    });

    it('should call recuperarPassword on valid email', fakeAsync(() => {
      authServiceSpy.recuperarPassword.and.returnValue(
        of({ mensaje: 'Si el correo test@test.com existe...' }),
      );
      component.form.setValue({ email: 'test@test.com' });
      component.onSubmit();
      tick();
      expect(authServiceSpy.recuperarPassword).toHaveBeenCalledWith('test@test.com');
      expect(component.mensaje).toContain('test@test.com');
      expect(component.loading).toBeFalse();
    }));

    it('should set error message on failure', fakeAsync(() => {
      authServiceSpy.recuperarPassword.and.returnValue(throwError(() => new Error('Error')));
      component.form.setValue({ email: 'test@test.com' });
      component.onSubmit();
      tick();
      expect(component.mensaje).toContain('error');
      expect(component.loading).toBeFalse();
    }));
  });
});
