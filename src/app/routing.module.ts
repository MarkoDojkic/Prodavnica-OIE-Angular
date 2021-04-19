import { ShopComponent } from './main/shop/shop.component';
import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { LoginComponent } from "./auth/login/login.component";
import { RegistrationComponent } from "./auth/registration/registration.component";
import { ProfilePageComponent } from "./main/profile-page/profile-page.component";
import { CartComponent } from './main/cart/cart.component';
import { OrderComponent } from './main/order/order.component';

const routes: Routes = [
    { path: 'login', component: LoginComponent, data: { title: 'Логовање' } },
    { path: 'registration', component: RegistrationComponent, data: { title: 'Регистрација' } },
    { path: 'profile', component: ProfilePageComponent, data: { title: 'Профил' } },
    { path: 'shop', component: ShopComponent, data: { title: 'Продавница' } },
    { path: 'cart', component: CartComponent, data: { title: 'Корпа' } },
    { path: 'order', component: OrderComponent, data: { title: 'Поруџбине' } }
]

@NgModule({
    imports: [
        RouterModule.forRoot(routes)
    ],
    exports: [
        RouterModule
    ]
})

export class RoutingModule { }