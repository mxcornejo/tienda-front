import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { PedidoService } from '../../../services/pedido';
import { Pedido } from '../../../models/models';

@Component({
  selector: 'app-admin-pedidos',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './admin-pedidos.html',
  styleUrls: ['./admin-pedidos.scss'],
})
export class AdminPedidosComponent implements OnInit {
  pedidos: Pedido[] = [];
  loading = true;
  error = '';
  success = '';
  estados = ['PENDIENTE', 'PROCESANDO', 'ENVIADO', 'ENTREGADO', 'CANCELADO'];

  constructor(private pedidoService: PedidoService) {}

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    this.loading = true;
    this.pedidoService.listarTodos().subscribe({
      next: (data) => {
        this.pedidos = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'Error al cargar pedidos.';
        this.loading = false;
      },
    });
  }

  estadoBadge(estado: string): string {
    const map: Record<string, string> = {
      PENDIENTE: 'bg-warning text-dark',
      PROCESANDO: 'bg-info text-dark',
      ENVIADO: 'bg-primary',
      ENTREGADO: 'bg-success',
      CANCELADO: 'bg-danger',
    };
    return map[estado] || 'bg-secondary';
  }

  actualizarEstado(id: number, estado: string) {
    this.pedidoService.actualizarEstado(id, estado).subscribe({
      next: () => {
        this.success = 'Estado actualizado.';
        this.cargar();
      },
      error: () => {
        this.error = 'Error al actualizar estado.';
      },
    });
  }

  cancelar(id: number) {
    if (!confirm('¿Cancelar este pedido?')) return;
    this.pedidoService.cancelar(id).subscribe({
      next: () => {
        this.success = 'Pedido cancelado.';
        this.cargar();
      },
      error: () => {
        this.error = 'Error al cancelar.';
      },
    });
  }
}
