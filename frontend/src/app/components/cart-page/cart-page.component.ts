import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService, CartItem } from '../../services/cart.service';
import { Apollo, gql } from 'apollo-angular';
import { Router } from '@angular/router';

const CREATE_ORDER = gql`
  mutation CreateOrder($items: [OrderItemInput!]!, $total: Float!) {
    createOrder(items: $items, total: $total){
      id
      total
      status
    }
  }
`;

@Component({
  selector: 'app-cart-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart-page.component.html',
  styleUrl: './cart-page.component.css',
})
export class CartPagComponent implements OnInit {
  cartItems: CartItem[] =[];
  totalPrice = 0;

  constructor(
    private cartService: CartService,
    private apollo: Apollo,
    private router: Router
  ){}

  ngOnInit(): void {
    //Escuta em tempo real as mudanças e mutações do carrinho de compras
    this.cartService.cart$.subscribe(items => {
      this.cartItems = items;
      this.totalPrice = this.cartService.getTotal();
    });
  }

  incrementQuantity(item: CartItem): void {
    if (item.product.id){
      this.cartService.updateQuantity(item.product.id, item.quantity +1);
    }
  }

  decrementQuantity(item: CartItem): void {
    if (item.product.id) {
      this.cartService.updateQuantity(item.product.id, item.quantity -1);
    }
  }

  removeItem(item: CartItem): void {
    if(item.product.id){
      this.cartService.removeFromCart(item.product.id);
    }
  }

  addMaisProdutos(): void {
       this.router.navigate(['/products']);
      return;
  }

  checkout(): void {
    if(this.cartItems.length === 0){
      this.router.navigate(['/products']);
      return;
    }

    // Mapeia o Array local para bater com a estrtura do OrderItemInput exigido pelo GrapQL
    const inputItems = this.cartItems.map(item => ({
      productId: item.product.id,
      quantity: item.quantity,
      priceAtPurchase: item.product.price
    }));

    this.apollo.mutate({
      mutation: CREATE_ORDER,
      variables: {
        items: inputItems,
        total: this.totalPrice
      }
    }).subscribe({
      next: (res: any) =>{
        alert(`Pedido finalizado com sucesso! ID do Pedido: ${res.data.createOrder.id}`);
        this.cartService.clearCart();
        this.router.navigate(['/products']);
      },
      error: (err) => {
        alert(`Erro na finalização: ${err.message}`);
      }
    });
  }
}
