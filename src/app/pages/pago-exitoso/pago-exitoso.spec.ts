import { TestBed, ComponentFixture } from '@angular/core/testing';
import { PagoExitosoComponent } from './pago-exitoso';
import { provideRouter, Router } from '@angular/router';
import { Pedido, Producto } from '../../models/models';

describe('PagoExitosoComponent', () => {
  let component: PagoExitosoComponent;
  let fixture: ComponentFixture<PagoExitosoComponent>;
  let router: Router;

  const mockPedido: Pedido = { id: 1, cantidad: 2, total: 200, estado: 'PENDIENTE' };
  const mockProducto: Producto = {
    id: 1,
    nombre: 'Laptop',
    descripcion: 'Gaming',
    precio: 100,
    stock: 5,
    categoria: 'Electrónica',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PagoExitosoComponent],
      providers: [provideRouter([])],
    }).compileComponents();
    router = TestBed.inject(Router);
  });

  describe('with navigation state', () => {
    beforeEach(() => {
      spyOn(router, 'getCurrentNavigation').and.returnValue({
        extras: { state: { pedido: mockPedido, producto: mockProducto } },
      } as any);
      fixture = TestBed.createComponent(PagoExitosoComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should assign pedido and producto from navigation state', () => {
      expect(component.pedido).toEqual(mockPedido);
      expect(component.producto).toEqual(mockProducto);
    });

    it('should set fechaHoy', () => {
      expect(component.fechaHoy).toBeTruthy();
    });
  });

  describe('without navigation state', () => {
    beforeEach(() => {
      spyOn(router, 'getCurrentNavigation').and.returnValue(null);
      fixture = TestBed.createComponent(PagoExitosoComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should have null pedido and produto when no state', () => {
      expect(component.pedido).toBeNull();
      expect(component.producto).toBeNull();
    });
  });
});
