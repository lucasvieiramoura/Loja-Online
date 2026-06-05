import { Injectable, signal } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // Utilizando o Signals para controlar o estado do login de forma reativa
  isAuthenticated = signal<boolean>(this.hasToken());

  constructor(private apollo: Apollo) {}

  // 1.Mutation de Cadastro
  register(name: string, email: string, password: string): Observable<any> {
    return this.apollo.mutate<any>({
      mutation: gql`
        mutation Register($name: String!, $email: String!, $password: String!) {
          register(name: $name, email: $email, password: $password) {
            token
            user {
              id
              name
              email
            }
          }
        }
      `,
      variables: { name, email, password },
    }).pipe(
      tap( result => { this.saveToken(result.data?.register?.token); } )
    );
  }

    // 3. Métodos autilizares para gerenciar o token 
    private saveToken(token: string | null): void {
      if (token) {
        localStorage.setItem('shop_token', token);
        this.isAuthenticated.set(true);
      }
    }

    getToken(): string | null {
      return localStorage.getItem('shop_token');
    }

    logout(): void {
      localStorage.removeItem('shop_token');
      this.isAuthenticated.set(false);
    }

    private hasToken(): boolean {
      return !!localStorage.getItem('shop_token');
    }
}


