import { TestBed, ComponentFixture } from '@angular/core/testing';
import { NavbarComponent } from './navbar';
import { provideRouter, Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { Usuario } from '../../models/models';

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let router: Router;

  const mockUsuario: Usuario = { id: 1, username: 'admin', email: 'a@a.com', rol: 'ROLE_ADMIN' };

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', [
      'isLoggedIn',
      'isAdmin',
      'getUsuario',
      'logout',
    ]);
    authServiceSpy.isLoggedIn.and.returnValue(true);
    authServiceSpy.isAdmin.and.returnValue(true);
    authServiceSpy.getUsuario.and.returnValue(mockUsuario);

    await TestBed.configureTestingModule({
      imports: [NavbarComponent],
      providers: [provideRouter([]), { provide: AuthService, useValue: authServiceSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('logout', () => {
    it('should call authService.logout and navigate to /login', () => {
      const navigateSpy = spyOn(router, 'navigate');
      component.logout();
      expect(authServiceSpy.logout).toHaveBeenCalled();
      expect(navigateSpy).toHaveBeenCalledWith(['/login']);
    });
  });
});
