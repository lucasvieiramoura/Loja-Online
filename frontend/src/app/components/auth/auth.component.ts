import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.css',
  standalone: true,
  imports: [FormsModule, CommonModule]
})
export class AuthComponent {
  // Controla se a tela exive o modo Login (true) ou Cadastro (false)
  isLoginMode = true;

  // Dados do Formulário
  name = ''
  email = '';
  password = '';

  // Messagem de Feedback
  errorMessage = '';
  loading = false;

  constructor(
    private authService: AuthService,
    private router: Router  
  ) {}

  //Alterna entre as abas de Login e Cadastro
  toggleMode(): void {
    this.isLoginMode = !this.isLoginMode;
    this.errorMessage = '';  // Limpa erros antigos ao mudar de tela
  }

  onSubmit(): void {
    if(!this.email || !this.password || (!this.isLoginMode && !this.name)) {
      this.errorMessage = 'Por favor, preencha todos os campos obrigatórios.';
      return;
    }
    
    this.loading = true;
    this.errorMessage = '';

    if (this.isLoginMode) {
      // Executa o Login
      this.authService.login(this.email, this.password).subscribe({
        next: (res) => {
          this.loading = false;
          console.log('Login bem-sucedido:', res);
          this.router.navigate(['/products']);
        },
        error: (err) => {
          this.loading = false;
          this.errorMessage = err.message || 'Erro ao fazer login. Tente novamente.';
          console.error('Erro no login:', err);
        },
      });
    }else {
      // Executa o Cadastro
      this.authService.register(this.name, this.email, this.password).subscribe({
        next: (res) => {
          this.loading = false;
          console.log('Cadastro bem-sucedido:', res);
          this.router.navigate(['/products']);
        },
        error: (err) => {
          this.loading = false;
          this.errorMessage = err.message || 'Erro ao fazer cadastro. Tente novamente.';
          console.error('Erro no cadastro:', err);
        },
      });
    } 
  }
}