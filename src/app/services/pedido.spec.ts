import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { PedidoService } from './pedido';
import { Pedido, CompraRequest } from '../models/models';

describe('PedidoService', () => {
  let service: PedidoService;
  let httpMock: HttpTestingController;

  const mockPedido: Pedido = {
    id: 1,
    cantidad: 2,
    total: 199.98,
    estado: 'PENDIENTE',
    fechaPedido: '2026-04-23',
  };

  const mockCompra: CompraRequest = { usuarioId: 1, productoId: 1, cantidad: 2 };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PedidoService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(PedidoService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('comprar', () => {
    it('should POST /api/catalogo/comprar', () => {
      service.comprar(mockCompra).subscribe((pedido) => {
        expect(pedido).toEqual(mockPedido);
      });
      const req = httpMock.expectOne('http://localhost:8080/api/catalogo/comprar');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockCompra);
      req.flush(mockPedido);
    });
  });

  describe('misCompras', () => {
    it('should GET /api/catalogo/mis-compras/:usuarioId', () => {
      service.misCompras(1).subscribe((pedidos) => {
        expect(pedidos).toEqual([mockPedido]);
      });
      const req = httpMock.expectOne('http://localhost:8080/api/catalogo/mis-compras/1');
      expect(req.request.method).toBe('GET');
      req.flush([mockPedido]);
    });
  });

  describe('listarTodos', () => {
    it('should GET /api/catalogo/compras', () => {
      service.listarTodos().subscribe((pedidos) => {
        expect(pedidos).toEqual([mockPedido]);
      });
      const req = httpMock.expectOne('http://localhost:8080/api/catalogo/compras');
      expect(req.request.method).toBe('GET');
      req.flush([mockPedido]);
    });
  });

  describe('actualizarEstado', () => {
    it('should PUT /api/catalogo/compras/:id/estado', () => {
      service.actualizarEstado(1, 'ENVIADO').subscribe((p) => {
        expect(p).toEqual(mockPedido);
      });
      const req = httpMock.expectOne('http://localhost:8080/api/catalogo/compras/1/estado');
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual({ estado: 'ENVIADO' });
      req.flush(mockPedido);
    });
  });

  describe('cancelar', () => {
    it('should DELETE /api/catalogo/compras/:id', () => {
      service.cancelar(1).subscribe();
      const req = httpMock.expectOne('http://localhost:8080/api/catalogo/compras/1');
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });
});
