import { TestBed, ComponentFixture, fakeAsync, tick } from '@angular/core/testing';
import { AdminProductosComponent } from './admin-productos';
import { provideRouter } from '@angular/router';
import { ProductoService } from '../../../services/producto';
import { of, throwError } from 'rxjs';
import { Producto } from '../../../models/models';

describe('AdminProductosComponent', () => {
  let component: AdminProductosComponent;
  let fixture: ComponentFixture<AdminProductosComponent>;
  let productoServiceSpy: jasmine.SpyObj<ProductoService>;

  const mockProductos: Producto[] = [
    { id: 1, nombre: 'Laptop', descripcion: 'Gaming', precio: 999, stock: 5, categoria: 'Tech' },
    { id: 2, nombre: 'Mouse', descripcion: 'Wireless', precio: 29, stock: 20, categoria: 'Tech' },
  ];

  beforeEach(async () => {
    productoServiceSpy = jasmine.createSpyObj('ProductoService', [
      'listarTodos',
      'agregar',
      'actualizar',
      'eliminar',
    ]);
    productoServiceSpy.listarTodos.and.returnValue(of(mockProductos));

    await TestBed.configureTestingModule({
      imports: [AdminProductosComponent],
      providers: [provideRouter([]), { provide: ProductoService, useValue: productoServiceSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminProductosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('cargar', () => {
    it('should load productos on init', () => {
      expect(component.productos).toEqual(mockProductos);
      expect(component.loading).toBeFalse();
    });

    it('should set error when loading fails', () => {
      productoServiceSpy.listarTodos.and.returnValue(throwError(() => new Error('Error')));
      component.cargar();
      expect(component.error).toBe('Error al cargar productos.');
      expect(component.loading).toBeFalse();
    });
  });

  describe('get f', () => {
    it('should expose form controls', () => {
      expect(component.f['nombre']).toBeTruthy();
      expect(component.f['precio']).toBeTruthy();
    });
  });

  describe('nuevo', () => {
    it('should reset form and show form panel', () => {
      component.nuevo();
      expect(component.editando).toBeNull();
      expect(component.mostrarFormulario).toBeTrue();
      expect(component.form.value.nombre).toBeNull();
    });
  });

  describe('editar', () => {
    it('should patch form with product values', () => {
      component.editar(mockProductos[0]);
      expect(component.editando).toEqual(mockProductos[0]);
      expect(component.mostrarFormulario).toBeTrue();
      expect(component.form.value.nombre).toBe('Laptop');
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

  describe('guardar – creating new product', () => {
    it('should mark all touched when form is invalid', () => {
      component.nuevo();
      component.guardar();
      expect(component.form.touched).toBeTrue();
    });

    it('should call agregar when creating a new product', fakeAsync(() => {
      productoServiceSpy.agregar.and.returnValue(of(mockProductos[0]));
      component.nuevo();
      component.form.setValue({
        nombre: 'Nuevo',
        descripcion: 'Desc',
        precio: 100,
        stock: 10,
        categoria: 'Cat',
      });
      component.guardar();
      tick();
      expect(productoServiceSpy.agregar).toHaveBeenCalled();
      expect(component.success).toContain('creado');
      expect(component.mostrarFormulario).toBeFalse();
    }));

    it('should set error on agregar failure', fakeAsync(() => {
      productoServiceSpy.agregar.and.returnValue(throwError(() => new Error('Error')));
      component.nuevo();
      component.form.setValue({
        nombre: 'Nuevo',
        descripcion: 'Desc',
        precio: 100,
        stock: 10,
        categoria: 'Cat',
      });
      component.guardar();
      tick();
      expect(component.error).toBe('Error al guardar el producto.');
    }));
  });

  describe('guardar – updating existing product', () => {
    it('should call actualizar when editing a product', fakeAsync(() => {
      productoServiceSpy.actualizar.and.returnValue(of(mockProductos[0]));
      component.editar(mockProductos[0]);
      component.guardar();
      tick();
      expect(productoServiceSpy.actualizar).toHaveBeenCalledWith(1, jasmine.any(Object));
      expect(component.success).toContain('actualizado');
    }));
  });

  describe('eliminar', () => {
    it('should not call eliminar when confirm returns false', () => {
      spyOn(window, 'confirm').and.returnValue(false);
      component.eliminar(1);
      expect(productoServiceSpy.eliminar).not.toHaveBeenCalled();
    });

    it('should call eliminar and reload after confirmation', fakeAsync(() => {
      spyOn(window, 'confirm').and.returnValue(true);
      productoServiceSpy.eliminar.and.returnValue(of(undefined));
      productoServiceSpy.listarTodos.and.returnValue(of([]));
      component.eliminar(1);
      tick();
      expect(productoServiceSpy.eliminar).toHaveBeenCalledWith(1);
    }));

    it('should set error on eliminar failure', fakeAsync(() => {
      spyOn(window, 'confirm').and.returnValue(true);
      productoServiceSpy.eliminar.and.returnValue(throwError(() => new Error('Error')));
      component.eliminar(1);
      tick();
      expect(component.error).toBe('Error al eliminar.');
    }));
  });
});
