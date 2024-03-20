import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LancamentosComponent } from './lancamentos/lancamentos.component';
import { PagamentosRegularesComponent } from './pagamentos-regulares/pagamentos-regulares.component';
import { FontesRegularesComponent } from './fontes-regulares/fontes-regulares.component';

const routes: Routes = [
  {path: '', redirectTo: 'dashboard', pathMatch: 'full'},
  {path: 'dashboard', component: DashboardComponent},
  {path: 'lancamentos', component: LancamentosComponent},
  {path: 'pagamentos-regulares', component: PagamentosRegularesComponent},
  {path: 'fontes-regulares', component: FontesRegularesComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
