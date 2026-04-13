export interface Usuario {
  id?: number;
  username: string;
  password?: string;
  rol?: string;
  email: string;
}

export interface Producto {
  id?: number;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  categoria: string;
}

export interface Pedido {
  id?: number;
  usuario?: Usuario;
  producto?: Producto;
  cantidad: number;
  total?: number;
  estado?: string;
  fechaPedido?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface CompraRequest {
  usuarioId: number;
  productoId: number;
  cantidad: number;
}
