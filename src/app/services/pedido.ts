import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Pedido, CompraRequest } from '../models/models';

@Injectable({ providedIn: 'root' })
export class PedidoService {
  private baseUrl = 'http://localhost:8080/api/catalogo';

  constructor(private http: HttpClient) {}

  comprar(req: CompraRequest): Observable<Pedido> {
    return this.http.post<Pedido>(`${this.baseUrl}/comprar`, req);
  }

  misCompras(usuarioId: number): Observable<Pedido[]> {
    return this.http.get<Pedido[]>(`${this.baseUrl}/mis-compras/${usuarioId}`);
  }

  listarTodos(): Observable<Pedido[]> {
    return this.http.get<Pedido[]>(`${this.baseUrl}/compras`);
  }

  actualizarEstado(id: number, estado: string): Observable<Pedido> {
    return this.http.put<Pedido>(`${this.baseUrl}/compras/${id}/estado`, { estado });
  }

  cancelar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/compras/${id}`);
  }
}
