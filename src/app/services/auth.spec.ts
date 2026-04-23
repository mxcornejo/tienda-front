import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth';
import { Usuario } from '../models/models';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  const mockUser: Usuario = {
    id: 1,
    username: 'testuser',
    email: 'test@test.com',
    rol: 'ROLE_CLIENTE',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuthService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    sessionStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    sessionStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // ── registro ─────────────────────────────────────────────────────────────
  describe('registro', () => {
    it('should POST to /api/usuarios/registro and return the user', () => {
      service.registro(mockUser).subscribe((user) => {
        expect(user).toEqual(mockUser);
      });
      const req = httpMock.expectOne('http://localhost:8080/api/usuarios/registro');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockUser);
      req.flush(mockUser);
    });
  });

  // ── login ─────────────────────────────────────────────────────────────────
  describe('login', () => {
    it('should GET /api/usuarios/login with Basic Authorization header', () => {
      service.login('testuser', 'pass123').subscribe();
      const req = httpMock.expectOne('http://localhost:8080/api/usuarios/login');
      expect(req.request.method).toBe('GET');
      expect(req.request.headers.get('Authorization')).toContain('Basic ');
      req.flush(mockUser);
    });

    it('should save session and credentials on successful login', () => {
      service.login('testuser', 'pass123').subscribe();
      const req = httpMock.expectOne('http://localhost:8080/api/usuarios/login');
      req.flush(mockUser);
      expect(sessionStorage.getItem('tienda_user')).toBe(JSON.stringify(mockUser));
      expect(sessionStorage.getItem('tienda_creds')).toBeTruthy();
    });

    it('should return "Credenciales inválidas" on 401', (done) => {
      service.login('testuser', 'wrong').subscribe({
        error: (err) => {
          expect(err.message).toBe('Credenciales inválidas');
          done();
        },
      });
      const req = httpMock.expectOne('http://localhost:8080/api/usuarios/login');
      req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
    });

    it('should return "Error al iniciar sesión" on non-401 error', (done) => {
      service.login('testuser', 'pass123').subscribe({
        error: (err) => {
          expect(err.message).toBe('Error al iniciar sesión');
          done();
        },
      });
      const req = httpMock.expectOne('http://localhost:8080/api/usuarios/login');
      req.flush('Server Error', { status: 500, statusText: 'Server Error' });
    });
  });

  // ── session management ────────────────────────────────────────────────────
  describe('saveSession', () => {
    it('should store user JSON in sessionStorage', () => {
      service.saveSession(mockUser);
      expect(sessionStorage.getItem('tienda_user')).toBe(JSON.stringify(mockUser));
    });
  });

  describe('actualizarCredenciales', () => {
    it('should store base64-encoded credentials', () => {
      service.actualizarCredenciales('user', 'pass');
      expect(sessionStorage.getItem('tienda_creds')).toBe(btoa('user:pass'));
    });
  });

  describe('logout', () => {
    it('should remove session and credentials from sessionStorage', () => {
      service.saveSession(mockUser);
      service.actualizarCredenciales('testuser', 'pass123');
      service.logout();
      expect(sessionStorage.getItem('tienda_user')).toBeNull();
      expect(sessionStorage.getItem('tienda_creds')).toBeNull();
    });
  });

  describe('isLoggedIn', () => {
    it('should return false when no session exists', () => {
      expect(service.isLoggedIn()).toBeFalse();
    });

    it('should return true when session exists', () => {
      service.saveSession(mockUser);
      expect(service.isLoggedIn()).toBeTrue();
    });
  });

  describe('getUsuario', () => {
    it('should return null when not logged in', () => {
      expect(service.getUsuario()).toBeNull();
    });

    it('should return the stored user when logged in', () => {
      service.saveSession(mockUser);
      expect(service.getUsuario()).toEqual(mockUser);
    });
  });

  describe('isAdmin', () => {
    it('should return false when not logged in', () => {
      expect(service.isAdmin()).toBeFalse();
    });

    it('should return false for ROLE_CLIENTE', () => {
      service.saveSession(mockUser);
      expect(service.isAdmin()).toBeFalse();
    });

    it('should return true for ROLE_ADMIN', () => {
      service.saveSession({ ...mockUser, rol: 'ROLE_ADMIN' });
      expect(service.isAdmin()).toBeTrue();
    });
  });

  // ── admin operations ──────────────────────────────────────────────────────
  describe('getAllUsuarios', () => {
    it('should GET /api/usuarios', () => {
      service.getAllUsuarios().subscribe((users) => {
        expect(users).toEqual([mockUser]);
      });
      const req = httpMock.expectOne('http://localhost:8080/api/usuarios');
      expect(req.request.method).toBe('GET');
      req.flush([mockUser]);
    });
  });

  describe('deleteUsuario', () => {
    it('should DELETE /api/usuarios/:id', () => {
      service.deleteUsuario(1).subscribe();
      const req = httpMock.expectOne('http://localhost:8080/api/usuarios/1');
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });

  describe('recuperarPassword', () => {
    it('should return a confirmation message containing the email', (done) => {
      service.recuperarPassword('test@test.com').subscribe((res) => {
        expect(res.mensaje).toContain('test@test.com');
        done();
      });
    });
  });
});
