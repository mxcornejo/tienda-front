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
});
