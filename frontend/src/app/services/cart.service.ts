import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Product } from './product.service';

export interface CartItem {
  product: Product;
  quantity: number;
}

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private cartItems: CartItem[] = [];
  //O BehaviorSubject ajuda a notificar qualquer componente ( Ex: a barra de navegação)
  private cartSubject = new BehaviorSubject<CartItem[]>([]);

  cart$ = this.cartSubject.asObservable();

  constructor() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart){
      this.cartItems = JSON.parse(savedCart);
      this.cartSubject.next(this.cartItems);
    }
  }

  getInterms(): CartItem[] {
    return this.cartItems;
  }

  addToCart(product: Product): any {
    const existingItem = this.cartItems.find(item => item.product.id === product.id)

    if (existingItem){
      existingItem.quantity +=1;
    } else {
      this.cartItems.push({product, quantity:1});
    }

    this.saveAndNotify();
  }

  removeFromCart(productId: string): void {
    this.cartItems = this.cartItems.filter(item => item.product.id !== productId);
    this.saveAndNotify();
  }

  updateQuantity(productId: string, quantity: number): void {
    const item = this.cartItems.find(item => item.product.id === productId);
    if (item) {
      item.quantity = quantity;
      if( item.quantity <= 0){
        this.removeFromCart(productId);
        return;
      }
    }
    this.saveAndNotify();
  }

  getTotal(): number {
    return this.cartItems.reduce((acc, item) => acc + (item.product.price * item.quantity), 0 );
  }

  clearCart(): void {
    this.cartItems = [];
    this.saveAndNotify();
  }

  private saveAndNotify(): void {
    localStorage.setItem('cart', JSON.stringify(this.cartItems));
    this.cartSubject.next(this.cartItems);
  }

}
