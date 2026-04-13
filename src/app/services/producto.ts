import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Producto } from '../models/models';

@Injectable({ providedIn: 'root' })
export class ProductoService {
  private adminUrl = 'http://localhost:8080/api/productos';
  private catalogoUrl = 'http://localhost:8080/api/catalogo';

  constructor(private http: HttpClient) {}

  // Catálogo público
  listarCatalogo(): Observable<Producto[]> {
    return this.http.get<Producto[]>(this.catalogoUrl);
  }

  verProducto(id: number): Observable<Producto> {
    return this.http.get<Producto>(`${this.catalogoUrl}/${id}`);
  }

  // Gestión admin
  listarTodos(): Observable<Producto[]> {
    return this.http.get<Producto[]>(this.adminUrl);
  }

  agregar(p: Producto): Observable<Producto> {
    return this.http.post<Producto>(this.adminUrl, p);
  }

  actualizar(id: number, p: Producto): Observable<Producto> {
    return this.http.put<Producto>(`${this.adminUrl}/${id}`, p);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.adminUrl}/${id}`);
  }
}
