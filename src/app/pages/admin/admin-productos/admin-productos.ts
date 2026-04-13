import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ProductoService } from '../../../services/producto';
import { Producto } from '../../../models/models';

@Component({
  selector: 'app-admin-productos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './admin-productos.html',
  styleUrls: ['./admin-productos.scss'],
})
export class AdminProductosComponent implements OnInit {
  productos: Producto[] = [];
  form: FormGroup;
  editando: Producto | null = null;
  loading = true;
  guardando = false;
  error = '';
  success = '';
  mostrarFormulario = false;
  eliminandoId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private productoService: ProductoService,
  ) {
    this.form = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(200)]],
      descripcion: ['', [Validators.required, Validators.maxLength(500)]],
      precio: [null, [Validators.required, Validators.min(0.01)]],
      stock: [null, [Validators.required, Validators.min(0)]],
      categoria: ['', [Validators.required, Validators.maxLength(100)]],
    });
  }

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    this.loading = true;
    this.productoService.listarTodos().subscribe({
      next: (data) => {
        this.productos = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'Error al cargar productos.';
        this.loading = false;
      },
    });
  }

  get f() {
    return this.form.controls;
  }

  nuevo() {
    this.editando = null;
    this.form.reset();
    this.mostrarFormulario = true;
    this.error = '';
    this.success = '';
  }

  editar(p: Producto) {
    this.editando = p;
    this.form.patchValue(p);
    this.mostrarFormulario = true;
    this.error = '';
    this.success = '';
  }

  cancelar() {
    this.mostrarFormulario = false;
    this.editando = null;
    this.form.reset();
  }

  guardar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.guardando = true;
    const data: Producto = this.form.value;
    const op = this.editando?.id
      ? this.productoService.actualizar(this.editando.id, data)
      : this.productoService.agregar(data);
    op.subscribe({
      next: () => {
        this.success = this.editando ? 'Producto actualizado.' : 'Producto creado.';
        this.guardando = false;
        this.mostrarFormulario = false;
        this.editando = null;
        this.cargar();
      },
      error: () => {
        this.error = 'Error al guardar el producto.';
        this.guardando = false;
      },
    });
  }

  eliminar(id: number) {
    if (!confirm('¿Eliminar este producto?')) return;
    this.eliminandoId = id;
    this.productoService.eliminar(id).subscribe({
      next: () => {
        this.eliminandoId = null;
        this.cargar();
      },
      error: () => {
        this.error = 'Error al eliminar.';
        this.eliminandoId = null;
      },
    });
  }
}
