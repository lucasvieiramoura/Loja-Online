import { ApplicationConfig, provideZoneChangeDetection, inject } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app-routing.module';
//import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideApollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { InMemoryCache } from '@apollo/client';
import { ApolloLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    //provideClientHydration(withEventReplay()),
    provideHttpClient(withFetch()),
    provideApollo(() => {
      /*
       const createApollo = (httpLink: HttpLink) => {
        const http = httpLink.create({ uri: 'http://localhost:4000/graphql' });

        // Middleware que intercept a requisição do Apollo e injeta o cabeçalho Autorization
        const authLink = setContext((_, { headers }) => {
          const token = localStorage.getItem('shop_token');
          return {
            headers: {
              ...headers,
              authorization: token ? `Bearer ${token}` : '',
            },
          };
        });
        */
        
      const httpLink = inject(HttpLink);
      const http = httpLink.create({ uri: 'http://localhost:4000/graphql' });
      const authLink = setContext((_, { headers }) => {
        const token = localStorage.getItem('shop_token');
        return {
          headers: {
            ...headers,
            authorization: token ? `Bearer ${token}` : '',
          },
        };
      });
      return {
        link: ApolloLink.from([authLink, http]),
        cache: new InMemoryCache(),
      };
    }),
  ],
};
