import { TestBed, ComponentFixture } from '@angular/core/testing';
import { MisComprasComponent } from './mis-compras';
import { provideRouter } from '@angular/router';
import { PedidoService } from '../../services/pedido';
import { AuthService } from '../../services/auth';
import { of, throwError } from 'rxjs';
import { Pedido, Usuario } from '../../models/models';

describe('MisComprasComponent', () => {
  let component: MisComprasComponent;
  let fixture: ComponentFixture<MisComprasComponent>;
  let pedidoServiceSpy: jasmine.SpyObj<PedidoService>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  const mockUsuario: Usuario = { id: 3, username: 'user', email: 'u@u.com' };
  const mockPedidos: Pedido[] = [
    { id: 1, cantidad: 1, total: 99, estado: 'PENDIENTE' },
    { id: 2, cantidad: 2, total: 200, estado: 'ENTREGADO' },
  ];

  function setup(usuario: Usuario | null = mockUsuario) {
    pedidoServiceSpy = jasmine.createSpyObj('PedidoService', ['misCompras']);
    authServiceSpy = jasmine.createSpyObj('AuthService', ['getUsuario']);
    authServiceSpy.getUsuario.and.returnValue(usuario);

    TestBed.configureTestingModule({
      imports: [MisComprasComponent],
      providers: [
        provideRouter([]),
        { provide: PedidoService, useValue: pedidoServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
      ],
    });
  }

  describe('with logged-in user', () => {
    beforeEach(async () => {
      setup();
      pedidoServiceSpy.misCompras.and.returnValue(of(mockPedidos));
      await TestBed.compileComponents();
      fixture = TestBed.createComponent(MisComprasComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should load the user pedidos', () => {
      expect(component.pedidos).toEqual(mockPedidos);
      expect(component.loading).toBeFalse();
    });

    it('should set error on loading failure', () => {
      pedidoServiceSpy.misCompras.and.returnValue(throwError(() => new Error('Error')));
      component.ngOnInit();
      expect(component.error).toBe('Error al cargar las compras.');
      expect(component.loading).toBeFalse();
    });
  });

  describe('with no user', () => {
    beforeEach(async () => {
      setup(null);
      await TestBed.compileComponents();
      fixture = TestBed.createComponent(MisComprasComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should not call misCompras if no user is logged in', () => {
      expect(pedidoServiceSpy.misCompras).not.toHaveBeenCalled();
    });
  });

  describe('estadoBadge', () => {
    beforeEach(async () => {
      setup();
      pedidoServiceSpy.misCompras.and.returnValue(of([]));
      await TestBed.compileComponents();
      fixture = TestBed.createComponent(MisComprasComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    const cases: [string, string][] = [
      ['PENDIENTE', 'bg-warning text-dark'],
      ['PROCESANDO', 'bg-info text-dark'],
      ['ENVIADO', 'bg-primary'],
      ['ENTREGADO', 'bg-success'],
      ['CANCELADO', 'bg-danger'],
      ['DESCONOCIDO', 'bg-secondary'],
    ];

    cases.forEach(([estado, expected]) => {
      it(`should return "${expected}" for estado "${estado}"`, () => {
        expect(component.estadoBadge(estado)).toBe(expected);
      });
    });
  });
});
