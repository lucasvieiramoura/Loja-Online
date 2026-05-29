import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// Queries e Mutations GraphQL
const GET_PRODUCTS = gql`
  query GetProducts {
    getProducts { id name price description stock category imageUrl }
  }
`;

const CREATE_PRODUCT = gql`
  mutation CreateProduct($name: String!, $description: String!, $price: Float!, $category: String!, $stock: Int!, $imageUrl: String!) {
    createProduct(name: $name, description: $description, price: $price, category: $category, stock: $stock, imageUrl: $imageUrl) {
      id name
    }
  }
`;

const DELETE_PRODUCT = gql`
  mutation DeleteProduct($id: ID!) {
    deleteProduct(id: $id) {
    }
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
        query: GET_PRODUCTS,
      })
      .valueChanges.pipe(map((result) => result.data.getProducts));
  }

  // Criar novo produto
  createProduct(product: any): Observable<any> {
    return this.apollo.mutate({
      mutation: CREATE_PRODUCT,
      variables: product,
      refetchQueries: [{ query: GET_PRODUCTS }], // Atualiza a lista automaticamente após a criação
    });
  }
  
  // Deletar produto
  deleteProduct(id: string): Observable<any> {
    return this.apollo.mutate({
      mutation: DELETE_PRODUCT,
      variables: { id },
      refetchQueries: [{ query: GET_PRODUCTS }], // Atualiza a lista automaticamente após a exclusão
    });
  }
}
