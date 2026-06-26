import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCoffee, faCartShopping, faFontAwesome } from '@fortawesome/free-solid-svg-icons'

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,FontAwesomeModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Loja Online';
  faCart = faCartShopping;
}

/*
export class AppComponent implements OnInit {
  products: any[] = [];
  newProduct = { name: '', description: '', price: 0, category: '', stock: 0, imageUrl: '' };

  // Injeta o ID da plataforma atual (Servidor ou Navegador)
  private platformId = inject(PLATFORM_ID);

  constructor(private productService: ProductService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    // Só dispara a busca se estiver rodando no navegador do usuário
   // if (isPlatformBrowser(this.platformId)) {
      this.loadProducts();
   // }
  }

loadProducts() {
  this.productService.getProducts().subscribe({ // Linha 31
    next: (data) => { 
      this.products = data; 
      this.cdr.markForCheck(); // Garante que a interface seja atualizada com os novos dados
    },
    error: (err) => { console.error(err); }
  });
}

  addProduct() {
    if(!this.newProduct.name || !this.newProduct.price) return; // Validação simples

    this.productService.createProduct(this.newProduct).subscribe(() => {
      this.loadProducts(); // Recarrega a lista após adicionar
      //Limpa o formulário após sucesso
      this.newProduct = { name: '', description: '', price: 0, category: '', stock: 0, imageUrl: '' };
      this.cdr.detectChanges(); // Força a atualização da interface após limpar o formulário
    });
  }

  deleteProduct(id: string) {
    this.productService.deleteProduct(id).subscribe({
      next: (response) => {
        console.log('Produto excluído:', response);
        this.cdr.detectChanges(); // Atualiza a interface após a exclusão
      },
      error: (err) => {
        console.error('Erro ao excluir produto:', err);
      }
    });
  } 
}

*/