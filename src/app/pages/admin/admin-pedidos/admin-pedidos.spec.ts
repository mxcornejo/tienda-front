import { TestBed, ComponentFixture, fakeAsync, tick } from '@angular/core/testing';
import { AdminPedidosComponent } from './admin-pedidos';
import { provideRouter } from '@angular/router';
import { PedidoService } from '../../../services/pedido';
import { of, throwError } from 'rxjs';
import { Pedido } from '../../../models/models';

describe('AdminPedidosComponent', () => {
  let component: AdminPedidosComponent;
  let fixture: ComponentFixture<AdminPedidosComponent>;
  let pedidoServiceSpy: jasmine.SpyObj<PedidoService>;

  const mockPedidos: Pedido[] = [
    { id: 1, cantidad: 1, total: 99, estado: 'PENDIENTE' },
    { id: 2, cantidad: 2, total: 200, estado: 'ENTREGADO' },
  ];

  beforeEach(async () => {
    pedidoServiceSpy = jasmine.createSpyObj('PedidoService', [
      'listarTodos',
      'actualizarEstado',
      'cancelar',
    ]);
    pedidoServiceSpy.listarTodos.and.returnValue(of(mockPedidos));

    await TestBed.configureTestingModule({
      imports: [AdminPedidosComponent],
      providers: [provideRouter([]), { provide: PedidoService, useValue: pedidoServiceSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminPedidosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('cargar', () => {
    it('should load all pedidos on init', () => {
      expect(component.pedidos).toEqual(mockPedidos);
      expect(component.loading).toBeFalse();
    });

    it('should set error when loading fails', () => {
      pedidoServiceSpy.listarTodos.and.returnValue(throwError(() => new Error('Error')));
      component.cargar();
      expect(component.error).toBe('Error al cargar pedidos.');
      expect(component.loading).toBeFalse();
    });
  });

  describe('estadoBadge', () => {
    const cases: [string, string][] = [
      ['PENDIENTE', 'bg-warning text-dark'],
      ['PROCESANDO', 'bg-info text-dark'],
      ['ENVIADO', 'bg-primary'],
      ['ENTREGADO', 'bg-success'],
      ['CANCELADO', 'bg-danger'],
      ['OTRO', 'bg-secondary'],
    ];

    cases.forEach(([estado, expected]) => {
      it(`should return "${expected}" for estado "${estado}"`, () => {
        expect(component.estadoBadge(estado)).toBe(expected);
      });
    });
  });

  describe('actualizarEstado', () => {
    it('should call pedidoService.actualizarEstado and reload', fakeAsync(() => {
      pedidoServiceSpy.actualizarEstado.and.returnValue(of(mockPedidos[0]));
      pedidoServiceSpy.listarTodos.and.returnValue(of(mockPedidos));
      component.actualizarEstado(1, 'ENVIADO');
      tick();
      expect(pedidoServiceSpy.actualizarEstado).toHaveBeenCalledWith(1, 'ENVIADO');
      expect(component.success).toBe('Estado actualizado.');
    }));

    it('should set error on actualizarEstado failure', fakeAsync(() => {
      pedidoServiceSpy.actualizarEstado.and.returnValue(throwError(() => new Error('Error')));
      component.actualizarEstado(1, 'ENVIADO');
      tick();
      expect(component.error).toBe('Error al actualizar estado.');
    }));
  });

  describe('cancelar', () => {
    it('should not call cancelar when confirm returns false', () => {
      spyOn(window, 'confirm').and.returnValue(false);
      component.cancelar(1);
      expect(pedidoServiceSpy.cancelar).not.toHaveBeenCalled();
    });

    it('should call cancelar and reload after confirmation', fakeAsync(() => {
      spyOn(window, 'confirm').and.returnValue(true);
      pedidoServiceSpy.cancelar.and.returnValue(of(undefined));
      pedidoServiceSpy.listarTodos.and.returnValue(of([]));
      component.cancelar(1);
      tick();
      expect(pedidoServiceSpy.cancelar).toHaveBeenCalledWith(1);
      expect(component.success).toBe('Pedido cancelado.');
    }));

    it('should set error on cancelar failure', fakeAsync(() => {
      spyOn(window, 'confirm').and.returnValue(true);
      pedidoServiceSpy.cancelar.and.returnValue(throwError(() => new Error('Error')));
      component.cancelar(1);
      tick();
      expect(component.error).toBe('Error al cancelar.');
    }));
  });
});
