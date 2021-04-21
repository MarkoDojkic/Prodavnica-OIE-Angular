import { NotFoundComponent } from './main/not-found/not-found.component';
import { ShopComponent } from './main/shop/shop.component';
import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { LoginComponent } from "./auth/login/login.component";
import { RegistrationComponent } from "./auth/registration/registration.component";
import { ProfilePageComponent } from "./main/profile-page/profile-page.component";
import { CartComponent } from './main/cart/cart.component';
import { OrderComponent } from './main/order/order.component';
import { canActivate, redirectLoggedInTo, redirectUnauthorizedTo, AngularFireAuthGuard } from '@angular/fire/auth-guard';

const redirectLoggedInToProfile = () => redirectLoggedInTo(["profile"]); //To resolve: https://github.com/angular/angularfire/issues/2099

const routes: Routes = [
    { path: '', redirectTo: "/shop", pathMatch: 'full'},
    { path: 'login', component: LoginComponent, canActivate: [AngularFireAuthGuard], data: { title: 'Логовање', authGuardPipe: redirectLoggedInToProfile } }, //Now working (glitch -> ...canActivate shortcut not working)
    { path: 'registration', component: RegistrationComponent, canActivate: [AngularFireAuthGuard], data: { title: 'Регистрација', authGuardPipe: redirectLoggedInToProfile } },
    { path: 'profile', component: ProfilePageComponent, ...canActivate(() => redirectUnauthorizedTo(['login'])), data: { title: 'Профил' } }, //Now working (auth needed refactoring)
    { path: 'shop', component: ShopComponent, data: { title: 'Продавница' } },
    { path: 'cart', component: CartComponent, ...canActivate(() => redirectUnauthorizedTo(['login'])), data: { title: 'Корпа' } },
    { path: 'order', component: OrderComponent, ...canActivate(() => redirectUnauthorizedTo(['login'])), data: { title: 'Поруџбине' } },
    { path: '**', component: NotFoundComponent, data: { title: '404' } }
]

@NgModule({
    imports: [
        RouterModule.forRoot(routes, /* { enableTracing: true } */)
    ],
    exports: [
        RouterModule
    ]
})

export class RoutingModule { }