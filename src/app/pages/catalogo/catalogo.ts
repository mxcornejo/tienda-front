import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductoService } from '../../services/producto';
import { AuthService } from '../../services/auth';
import { Producto } from '../../models/models';

@Component({
  selector: 'app-catalogo',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './catalogo.html',
  styleUrls: ['./catalogo.scss'],
})
export class CatalogoComponent implements OnInit {
  productos: Producto[] = [];
  filtrados: Producto[] = [];
  busqueda = '';
  categoriaFiltro = '';
  categorias: string[] = [];
  loading = true;
  error = '';

  constructor(
    private productoService: ProductoService,
    public authService: AuthService,
  ) {}

  ngOnInit() {
    this.productoService.listarCatalogo().subscribe({
      next: (data) => {
        this.productos = data;
        this.filtrados = data;
        this.categorias = [...new Set(data.map((p) => p.categoria))];
        this.loading = false;
      },
      error: () => {
        this.error = 'Error al cargar el catálogo.';
        this.loading = false;
      },
    });
  }

  filtrar() {
    this.filtrados = this.productos.filter(
      (p) =>
        (this.busqueda === '' ||
          p.nombre.toLowerCase().includes(this.busqueda.toLowerCase()) ||
          p.descripcion.toLowerCase().includes(this.busqueda.toLowerCase())) &&
        (this.categoriaFiltro === '' || p.categoria === this.categoriaFiltro),
    );
  }

  limpiarFiltros() {
    this.busqueda = '';
    this.categoriaFiltro = '';
    this.filtrados = this.productos;
  }
}
