import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { ProductoService } from './producto';
import { Producto } from '../models/models';

describe('ProductoService', () => {
  let service: ProductoService;
  let httpMock: HttpTestingController;

  const mockProducto: Producto = {
    id: 1,
    nombre: 'Laptop',
    descripcion: 'Laptop gaming',
    precio: 999.99,
    stock: 10,
    categoria: 'Electrónica',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ProductoService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ProductoService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('listarCatalogo', () => {
    it('should GET /api/catalogo', () => {
      service.listarCatalogo().subscribe((productos) => {
        expect(productos).toEqual([mockProducto]);
      });
      const req = httpMock.expectOne('http://localhost:8080/api/catalogo');
      expect(req.request.method).toBe('GET');
      req.flush([mockProducto]);
    });
  });

  describe('verProducto', () => {
    it('should GET /api/catalogo/:id', () => {
      service.verProducto(1).subscribe((p) => {
        expect(p).toEqual(mockProducto);
      });
      const req = httpMock.expectOne('http://localhost:8080/api/catalogo/1');
      expect(req.request.method).toBe('GET');
      req.flush(mockProducto);
    });
  });

  describe('listarTodos', () => {
    it('should GET /api/productos', () => {
      service.listarTodos().subscribe((productos) => {
        expect(productos).toEqual([mockProducto]);
      });
      const req = httpMock.expectOne('http://localhost:8080/api/productos');
      expect(req.request.method).toBe('GET');
      req.flush([mockProducto]);
    });
  });

  describe('agregar', () => {
    it('should POST /api/productos', () => {
      const nuevo = { ...mockProducto, id: undefined };
      service.agregar(nuevo).subscribe((p) => {
        expect(p).toEqual(mockProducto);
      });
      const req = httpMock.expectOne('http://localhost:8080/api/productos');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(nuevo);
      req.flush(mockProducto);
    });
  });

  describe('actualizar', () => {
    it('should PUT /api/productos/:id', () => {
      service.actualizar(1, mockProducto).subscribe((p) => {
        expect(p).toEqual(mockProducto);
      });
      const req = httpMock.expectOne('http://localhost:8080/api/productos/1');
      expect(req.request.method).toBe('PUT');
      req.flush(mockProducto);
    });
  });

  describe('eliminar', () => {
    it('should DELETE /api/productos/:id', () => {
      service.eliminar(1).subscribe();
      const req = httpMock.expectOne('http://localhost:8080/api/productos/1');
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });
});
