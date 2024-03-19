import { INavbarData } from "./helper"

export const menuData: INavbarData[] = [
    {
        routerLink: 'dashboard',
        icon: 'dashboard',
        label: 'Dashboard'
    },
    {
        routerLink: 'lancamentos',
        icon: 'swap_horizontal_circle',
        label: 'Lançamentos'
    },
    {
        routerLink: '#cartoes-credito',
        icon: 'credit_card',
        label: 'Cartões de Crédito',
        subitens: [
            {
                routerLink: 'cadastrar-cartao-credito',
                label: 'Cadastrar',
            },
            {
                routerLink: 'gerenciar-cartoes-credito',
                label: 'Gerenciar',
            },
            {
                routerLink: 'faturas-cartoes-credito',
                label: 'Faturas',
            }
        ]
    },
    {
        routerLink: '#descritivos',
        icon: 'description',
        label: 'Descritivos',
        subitens: [
            {
                routerLink: 'gerenciar-categorias',
                label: 'Gerenciar Categorias'
            },
            {
                routerLink: 'cadastrar-descritivo',
                label: 'Criar Descritivo'
            },
            {
                routerLink: 'consultar-descritivo',
                label: 'Consultar Descritivos'
            }
        ]
    },
    {
        routerLink: '#eventos-regulares',
        icon: 'event_repeat',
        label: 'Eventos Regulares',
        subitens: [
            {
                routerLink: 'pagamentos-regulares',
                label: 'Pag. Regulares',
                subitens: [
                    {
                        routerLink: 'criar-pag-regular',
                        label: 'Criar novo'
                    },
                    {
                        routerLink: 'listar-pag-regulares',
                        label: 'consultar'
                    }
                ]
            },
            {
                routerLink: 'fontes-regulares',
                label: 'Fontes Regulares'
            }
        ]
    },
    {
        routerLink: 'contas',
        icon: 'account_balance',
        label: 'Contas',
        subitens: []
    }
]

export type Submenu = {id: string, visivel: boolean}
