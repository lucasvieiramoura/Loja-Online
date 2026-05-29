import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from './services/product.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {
  products: any[] = [];
  newProduct = { name: '', description: '', price: 0, category: '', stock: 0, imageUrl: '' };

  // Injeta o ID da plataforma atual (Servidor ou Navegador)
  private platformId = inject(PLATFORM_ID);

  constructor(private productService: ProductService) {}

  ngOnInit() {
    // Só dispara a busca se estiver rodando no navegador do usuário
    if (isPlatformBrowser(this.platformId)) {
      this.loadProducts();
    }
  }

  loadProducts() {
    this.productService.getProducts().subscribe((data) => {
      this.products = data;
    });
  }

  addProduct() {
    if(!this.newProduct.name || !this.newProduct.price) return; // Validação simples

    this.productService.createProduct(this.newProduct).subscribe(() => {
      //Limpa o formulário após sucesso
      this.newProduct = { name: '', description: '', price: 0, category: '', stock: 0, imageUrl: '' };
    });
  }

  deleteProduct(id: string) {
    this.productService.deleteProduct(id).subscribe();
  }
}

