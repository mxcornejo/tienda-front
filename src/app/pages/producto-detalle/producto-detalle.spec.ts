import { TestBed, ComponentFixture, fakeAsync, tick } from '@angular/core/testing';
import { ProductoDetalleComponent } from './producto-detalle';
import { provideRouter, Router, ActivatedRoute } from '@angular/router';
import { ProductoService } from '../../services/producto';
import { PedidoService } from '../../services/pedido';
import { AuthService } from '../../services/auth';
import { of, throwError } from 'rxjs';
import { Producto, Pedido, Usuario } from '../../models/models';

describe('ProductoDetalleComponent', () => {
  let component: ProductoDetalleComponent;
  let fixture: ComponentFixture<ProductoDetalleComponent>;
  let productoServiceSpy: jasmine.SpyObj<ProductoService>;
  let pedidoServiceSpy: jasmine.SpyObj<PedidoService>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let router: Router;

  const mockProducto: Producto = {
    id: 1,
    nombre: 'Laptop',
    descripcion: 'Gaming laptop',
    precio: 100,
    stock: 5,
    categoria: 'Electrónica',
  };
  const mockPedido: Pedido = { id: 10, cantidad: 2, total: 200, estado: 'PENDIENTE' };
  const mockUsuario: Usuario = { id: 5, username: 'user', email: 'u@u.com' };

  function setupTestBed(productId = '1', loggedIn = true) {
    productoServiceSpy = jasmine.createSpyObj('ProductoService', ['verProducto']);
    pedidoServiceSpy = jasmine.createSpyObj('PedidoService', ['comprar']);
    authServiceSpy = jasmine.createSpyObj('AuthService', ['isLoggedIn', 'getUsuario']);
    authServiceSpy.isLoggedIn.and.returnValue(loggedIn);
    authServiceSpy.getUsuario.and.returnValue(loggedIn ? mockUsuario : null);

    TestBed.configureTestingModule({
      imports: [ProductoDetalleComponent],
      providers: [
        provideRouter([]),
        { provide: ProductoService, useValue: productoServiceSpy },
        { provide: PedidoService, useValue: pedidoServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => productId } } },
        },
      ],
    });

    fixture = TestBed.createComponent(ProductoDetalleComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
  }

  describe('ngOnInit – product found', () => {
    beforeEach(async () => {
      setupTestBed();
      productoServiceSpy.verProducto.and.returnValue(of(mockProducto));
      await TestBed.compileComponents();
      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should load the product', () => {
      expect(component.producto).toEqual(mockProducto);
      expect(component.loading).toBeFalse();
    });

    it('should expose form controls via f', () => {
      expect(component.f['cantidad']).toBeTruthy();
    });

    it('should calculate total correctly', () => {
      component.form.setValue({ cantidad: 3 });
      expect(component.total).toBe(300);
    });
  });

  describe('ngOnInit – product not found', () => {
    beforeEach(async () => {
      setupTestBed();
      productoServiceSpy.verProducto.and.returnValue(throwError(() => new Error('Not Found')));
      await TestBed.compileComponents();
      fixture.detectChanges();
    });

    it('should set error when product not found', () => {
      expect(component.error).toBe('Producto no encontrado.');
      expect(component.loading).toBeFalse();
    });
  });

  describe('comprar', () => {
    beforeEach(async () => {
      setupTestBed();
      productoServiceSpy.verProducto.and.returnValue(of(mockProducto));
      await TestBed.compileComponents();
      fixture.detectChanges();
    });

    it('should mark form as touched when invalid', () => {
      component.form.setValue({ cantidad: 0 });
      component.comprar();
      expect(component.form.touched).toBeTrue();
    });

    it('should redirect to /login when not logged in', () => {
      authServiceSpy.isLoggedIn.and.returnValue(false);
      const navigateSpy = spyOn(router, 'navigate');
      component.form.setValue({ cantidad: 1 });
      component.comprar();
      expect(navigateSpy).toHaveBeenCalledWith(['/login'], jasmine.any(Object));
    });

    it('should return early when usuario has no id', () => {
      authServiceSpy.isLoggedIn.and.returnValue(true);
      authServiceSpy.getUsuario.and.returnValue({ username: 'u', email: 'u@u.com' }); // no id
      component.form.setValue({ cantidad: 1 });
      component.comprar();
      expect(pedidoServiceSpy.comprar).not.toHaveBeenCalled();
    });

    it('should call pedidoService.comprar on valid form with logged-in user', fakeAsync(() => {
      pedidoServiceSpy.comprar.and.returnValue(of(mockPedido));
      const navigateSpy = spyOn(router, 'navigate');
      component.form.setValue({ cantidad: 2 });
      component.comprar();
      tick();
      expect(pedidoServiceSpy.comprar).toHaveBeenCalledWith({
        usuarioId: 5,
        productoId: 1,
        cantidad: 2,
      });
      expect(navigateSpy).toHaveBeenCalledWith(['/pago-exitoso'], jasmine.any(Object));
    }));

    it('should set error on purchase failure', fakeAsync(() => {
      pedidoServiceSpy.comprar.and.returnValue(throwError(() => new Error('Error')));
      component.form.setValue({ cantidad: 2 });
      component.comprar();
      tick();
      expect(component.error).toBe('Error al procesar la compra.');
      expect(component.comprando).toBeFalse();
    }));
  });
});
