import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ProductoService } from '../../services/producto';
import { PedidoService } from '../../services/pedido';
import { AuthService } from '../../services/auth';
import { Producto } from '../../models/models';

@Component({
  selector: 'app-producto-detalle',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './producto-detalle.html',
  styleUrls: ['./producto-detalle.scss'],
})
export class ProductoDetalleComponent implements OnInit {
  producto: Producto | null = null;
  form: FormGroup;
  loading = true;
  comprando = false;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private productoService: ProductoService,
    private pedidoService: PedidoService,
    public authService: AuthService,
  ) {
    this.form = this.fb.group({
      cantidad: [1, [Validators.required, Validators.min(1)]],
    });
  }

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.productoService.verProducto(id).subscribe({
      next: (p) => {
        this.producto = p;
        this.loading = false;
      },
      error: () => {
        this.error = 'Producto no encontrado.';
        this.loading = false;
      },
    });
  }

  get f() {
    return this.form.controls;
  }

  get total(): number {
    return (this.producto?.precio || 0) * (this.form.value.cantidad || 1);
  }

  comprar() {
    if (this.form.invalid || !this.producto?.id) {
      this.form.markAllAsTouched();
      return;
    }
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }
    const usuario = this.authService.getUsuario();
    if (!usuario?.id) return;
    this.comprando = true;
    this.pedidoService
      .comprar({
        usuarioId: usuario.id,
        productoId: this.producto.id,
        cantidad: this.form.value.cantidad,
      })
      .subscribe({
        next: (pedido) =>
          this.router.navigate(['/pago-exitoso'], { state: { pedido, producto: this.producto } }),
        error: () => {
          this.error = 'Error al procesar la compra.';
          this.comprando = false;
        },
      });
  }
}
