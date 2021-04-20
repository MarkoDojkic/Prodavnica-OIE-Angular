import { NotFoundComponent } from './main/not-found/not-found.component';
import { ShopComponent } from './main/shop/shop.component';
import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { LoginComponent } from "./auth/login/login.component";
import { RegistrationComponent } from "./auth/registration/registration.component";
import { ProfilePageComponent } from "./main/profile-page/profile-page.component";
import { CartComponent } from './main/cart/cart.component';
import { OrderComponent } from './main/order/order.component';
import { canActivate, redirectLoggedInTo, redirectUnauthorizedTo } from '@angular/fire/auth-guard';

const routes: Routes = [
    { path: '', redirectTo: "/shop", pathMatch: 'full'},
    { path: 'login', component: LoginComponent, ...canActivate(() => redirectLoggedInTo(['profile'])), data: { title: 'Логовање' } }, /* AngularFireAuthGuard not working */
    { path: 'registration', component: RegistrationComponent, ...canActivate(() => redirectLoggedInTo(['profile'])), data: { title: 'Регистрација' } }, /* AngularFireAuthGuard not working */
    { path: 'profile', component: ProfilePageComponent, ...canActivate(() => redirectUnauthorizedTo(['login'])), data: { title: 'Профил' } }, /* AngularFireAuthGuard working */
    { path: 'shop', component: ShopComponent, data: { title: 'Продавница' } },
    { path: 'cart', component: CartComponent, ...canActivate(() => redirectUnauthorizedTo(['login'])), data: { title: 'Корпа' } }, /* AngularFireAuthGuard not working */
    { path: 'order', component: OrderComponent, ...canActivate(() => redirectUnauthorizedTo(['login'])), data: { title: 'Поруџбине' } }, /* AngularFireAuthGuard not working */
    { path: '**', component: NotFoundComponent, data: { title: '404' } }
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