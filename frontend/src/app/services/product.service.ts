import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// 1. QUERY: Busca produtos (Sem vírgulas entre os campos!)
const GET_PRODUCTS = gql`
  query GetProducts {
    getProducts {
      id
      name
      price
      stock
      category
      description
      imageUrl
    }
  }
`;

// 2. MUTATION: Cria produto (Atenção à sintaxe dos parâmetros)
const CREATE_PRODUCT = gql`
  mutation CreateProduct($name: String!, $description: String, $price: Float!, $stock: Int!, $imageUrl: String, $category: String) {
    createProduct(name: $name, description: $description, price: $price, stock: $stock, imageUrl: $imageUrl, category: $category) {
      id
      name
    }
  }
`;

// 3. MUTATION: Deleta produto
const DELETE_PRODUCT = gql`
  mutation DeleteProduct($id: ID!) {
    deleteProduct(id: $id)
  }
`;

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  constructor(private apollo: Apollo) {}

  //Ler todos os produtos
  getProducts(): Observable<any[]> {
    return this.apollo
      .watchQuery<any>({
        query: gql`
          query GetProducts {
            getProducts {
            id
            name
            description
            price
            category
            stock
            imageUrl
          }
        }
        `,
        fetchPolicy: 'network-only', // Garante que sempre busque do servidor, não do cache
      })
      .valueChanges.pipe(map((result) => 
      {
          return result?.data?.getProducts || [];
       
      }
      )); // result?.data?.getProducts || [] )); // O operador '?' garante que se data fro undefined, não vai quebrar o código
  }

  // Criar novo produto
  createProduct(product: any): Observable<any> {
    return this.apollo.mutate({
      mutation: gql`
        mutation CreateProduct(
          $name: String!,
          $description: String,
          $price: Float!,
          $stock: Int!,
          $imageUrl: String,
          $category: String          
        ) {
          createProduct(
           name: $name
            description: $description
            price: $price
            stock: $stock
            imageUrl: $imageUrl
            category: $category
            ) {
           id 
           name
          }
        }
      `,
      variables: {
          name: product.name,
          description: product.description || '',
          price: parseFloat(product.price), // Garante que vai como Float númericoq
          stock: parseInt(product.stock, 10) || 0, // Garante que vai como Int númerico
        imageUrl: product.imageUrl || '',
        category: product.category || '',
      },
      refetchQueries: [{ query: gql`
        query GetProducts {
          getProducts {
            id
            name
            description
            price
            category
            stock
            imageUrl
          }
        }
      `}  
      ]
    });
  }
  
  // Deletar produto
  deleteProduct(id: string): Observable<any> {
    return this.apollo.mutate({
      mutation: gql`
        mutation DeleteProduct($id: ID!) {
          deleteProduct(id: $id) 
        }
      `,
      variables: { id },
      update: (cache) => { 
        cache.modify({
          fields: {
            getProducts(existingProducts = [], { readField }) {
              return existingProducts.filter(
                (productRef: any) => id !== readField('id', productRef)
              );
            }
          }
        });
      }
    });
  }
}
