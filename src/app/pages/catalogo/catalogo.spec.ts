import { TestBed, ComponentFixture } from '@angular/core/testing';
import { CatalogoComponent } from './catalogo';
import { provideRouter } from '@angular/router';
import { ProductoService } from '../../services/producto';
import { AuthService } from '../../services/auth';
import { of, throwError } from 'rxjs';
import { Producto } from '../../models/models';

describe('CatalogoComponent', () => {
  let component: CatalogoComponent;
  let fixture: ComponentFixture<CatalogoComponent>;
  let productoServiceSpy: jasmine.SpyObj<ProductoService>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  const mockProductos: Producto[] = [
    {
      id: 1,
      nombre: 'Laptop',
      descripcion: 'Gaming laptop',
      precio: 999,
      stock: 5,
      categoria: 'Electrónica',
    },
    {
      id: 2,
      nombre: 'Mouse',
      descripcion: 'Wireless mouse',
      precio: 29,
      stock: 20,
      categoria: 'Accesorios',
    },
    {
      id: 3,
      nombre: 'Monitor',
      descripcion: '4K Monitor',
      precio: 499,
      stock: 8,
      categoria: 'Electrónica',
    },
  ];

  beforeEach(async () => {
    productoServiceSpy = jasmine.createSpyObj('ProductoService', ['listarCatalogo']);
    authServiceSpy = jasmine.createSpyObj('AuthService', ['isLoggedIn', 'isAdmin']);
    productoServiceSpy.listarCatalogo.and.returnValue(of(mockProductos));
    authServiceSpy.isLoggedIn.and.returnValue(false);
    authServiceSpy.isAdmin.and.returnValue(false);

    await TestBed.configureTestingModule({
      imports: [CatalogoComponent],
      providers: [
        provideRouter([]),
        { provide: ProductoService, useValue: productoServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CatalogoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should load products and set categorias', () => {
      expect(component.productos).toEqual(mockProductos);
      expect(component.filtrados).toEqual(mockProductos);
      expect(component.categorias.length).toBe(2);
      expect(component.loading).toBeFalse();
    });

    it('should set error message when loading fails', async () => {
      productoServiceSpy.listarCatalogo.and.returnValue(
        throwError(() => new Error('Network error')),
      );
      component.ngOnInit();
      expect(component.error).toBe('Error al cargar el catálogo.');
      expect(component.loading).toBeFalse();
    });
  });

  describe('filtrar', () => {
    it('should filter by search text (nombre)', () => {
      component.busqueda = 'Laptop';
      component.filtrar();
      expect(component.filtrados.length).toBe(1);
      expect(component.filtrados[0].nombre).toBe('Laptop');
    });

    it('should filter by search text (descripcion)', () => {
      component.busqueda = 'Wireless';
      component.filtrar();
      expect(component.filtrados.length).toBe(1);
      expect(component.filtrados[0].nombre).toBe('Mouse');
    });

    it('should filter by categoria', () => {
      component.categoriaFiltro = 'Electrónica';
      component.filtrar();
      expect(component.filtrados.length).toBe(2);
    });

    it('should combine text and category filters', () => {
      component.busqueda = 'Monitor';
      component.categoriaFiltro = 'Electrónica';
      component.filtrar();
      expect(component.filtrados.length).toBe(1);
    });

    it('should return all products when no filters are applied', () => {
      component.busqueda = '';
      component.categoriaFiltro = '';
      component.filtrar();
      expect(component.filtrados.length).toBe(3);
    });
  });

  describe('limpiarFiltros', () => {
    it('should reset filters and show all products', () => {
      component.busqueda = 'Laptop';
      component.categoriaFiltro = 'Electrónica';
      component.filtrados = [];
      component.limpiarFiltros();
      expect(component.busqueda).toBe('');
      expect(component.categoriaFiltro).toBe('');
      expect(component.filtrados).toEqual(mockProductos);
    });
  });
});
