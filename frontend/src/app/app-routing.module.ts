import { Routes } from '@angular/router';
import { AuthComponent } from './components/auth/auth.component';
import { authGuard } from './guards/auth.guard';
import { ProductListComponent } from './components/product-list/product-list.component';

export const routes: Routes = [
    // Rota pública qualquer um acessa a tela de Login/Cadastro
    { path: 'login', component: AuthComponent },

    // Rota protegida: o catálogo/CRUD de produtos só abre se passar pelo authGuard
    {
        path: 'products',
        component: ProductListComponent,
        canActivate: [authGuard],
    },

    // Redirecinamento padrão caso digite rota vazia
    {path: '', redirectTo: '/login', pathMatch: 'full'},

    // Rota coringa caso digite qualquer coisa errada
    {path: '**', redirectTo: '/login'},
];

