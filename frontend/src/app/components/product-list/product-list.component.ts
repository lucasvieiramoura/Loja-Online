import {Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ProductService, Product } from '../../services/product.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-product-list',
    templateUrl: './product-list.component.html',
    styleUrl: './product-list.component.css',
    standalone: true,
    imports: [FormsModule, CommonModule]
})

export class ProductListComponent implements OnInit {
    products: any[] = [];
    newProduct = { name: '', description: '', price: 0, category: '', stock: 0, imageUrl: '' };

    constructor(
        private productService: ProductService,
        private cdr: ChangeDetectorRef
    ) {}

    ngOnInit() {
        this.loadProducts();
    }

    loadProducts() {
        this.productService.getProducts().subscribe({
            next: (data) => { 
                this.products = data;
                this.cdr.detectChanges();
            }
        });
    }

    addProduct() {
        this.productService.createProduct(this.newProduct).subscribe({
            next: () => {
                this.newProduct = {name : '', description: '', price: 0, category: '', stock: 0, imageUrl: ''};
                this.cdr.detectChanges();
                this.loadProducts();
            }
        });
    }

    deleteProduct(id: string) {
        this.productService.deleteProduct(id).subscribe({
            next: () => {
                this.cdr.detectChanges();
                this.loadProducts();
            }  
        });

    }
}