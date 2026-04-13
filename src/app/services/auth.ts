import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Usuario } from '../models/models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private baseUrl = 'http://localhost:8080/api/usuarios';
  private SESSION_KEY = 'tienda_user';
  private CREDS_KEY = 'tienda_creds';

  constructor(private http: HttpClient) {}

  registro(usuario: Usuario): Observable<Usuario> {
    return this.http.post<Usuario>(`${this.baseUrl}/registro`, usuario);
  }

  login(username: string, password: string): Observable<Usuario> {
    const creds = btoa(`${username}:${password}`);
    const headers = new HttpHeaders({ Authorization: `Basic ${creds}` });
    return this.http.get<Usuario>(`${this.baseUrl}/login`, { headers }).pipe(
      tap((user) => {
        sessionStorage.setItem(this.CREDS_KEY, creds);
        this.saveSession(user);
      }),
      catchError((err) =>
        throwError(
          () =>
            new Error(err.status === 401 ? 'Credenciales inválidas' : 'Error al iniciar sesión'),
        ),
      ),
    );
  }

  saveSession(usuario: Usuario): void {
    sessionStorage.setItem(this.SESSION_KEY, JSON.stringify(usuario));
  }

  actualizarCredenciales(username: string, password: string): void {
    sessionStorage.setItem(this.CREDS_KEY, btoa(`${username}:${password}`));
  }

  logout(): void {
    sessionStorage.removeItem(this.SESSION_KEY);
    sessionStorage.removeItem(this.CREDS_KEY);
  }

  isLoggedIn(): boolean {
    return !!sessionStorage.getItem(this.SESSION_KEY);
  }

  getUsuario(): Usuario | null {
    const data = sessionStorage.getItem(this.SESSION_KEY);
    return data ? JSON.parse(data) : null;
  }

  isAdmin(): boolean {
    const u = this.getUsuario();
    return u?.rol === 'ROLE_ADMIN';
  }

  getAllUsuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.baseUrl);
  }

  deleteUsuario(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  recuperarPassword(email: string): Observable<any> {
    return of({
      mensaje: `Si el correo ${email} existe, recibirás instrucciones para restablecer tu contraseña.`,
    });
  }
}
