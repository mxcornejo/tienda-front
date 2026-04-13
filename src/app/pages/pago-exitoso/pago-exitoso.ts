import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Pedido, Producto } from '../../models/models';

@Component({
  selector: 'app-pago-exitoso',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './pago-exitoso.html',
  styleUrls: ['./pago-exitoso.scss'],
})
export class PagoExitosoComponent implements OnInit {
  pedido: Pedido | null = null;
  producto: Producto | null = null;
  fechaHoy = new Date();

  constructor(private router: Router) {}

  ngOnInit() {
    const state = this.router.getCurrentNavigation()?.extras?.state as any;
    if (state) {
      this.pedido = state['pedido'];
      this.producto = state['producto'];
    }
  }
}
