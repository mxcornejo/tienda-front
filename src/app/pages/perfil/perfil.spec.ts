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
  });
});
