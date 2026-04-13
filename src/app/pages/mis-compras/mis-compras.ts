import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PedidoService } from '../../services/pedido';
import { AuthService } from '../../services/auth';
import { Pedido } from '../../models/models';

@Component({
  selector: 'app-mis-compras',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './mis-compras.html',
  styleUrls: ['./mis-compras.scss'],
})
export class MisComprasComponent implements OnInit {
  pedidos: Pedido[] = [];
  loading = true;
  error = '';

  constructor(
    private pedidoService: PedidoService,
    public authService: AuthService,
  ) {}

  ngOnInit() {
    const usuario = this.authService.getUsuario();
    if (!usuario?.id) return;
    this.pedidoService.misCompras(usuario.id).subscribe({
      next: (data) => {
        this.pedidos = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'Error al cargar las compras.';
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
}
