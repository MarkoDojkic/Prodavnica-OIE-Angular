import { NotFoundComponent } from './main/not-found/not-found.component';
import { ShopComponent } from './main/shop/shop.component';
import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { LoginComponent } from "./auth/login/login.component";
import { RegistrationComponent } from "./auth/registration/registration.component";
import { ProfilePageComponent } from "./main/profile-page/profile-page.component";
import { CartComponent } from './main/cart/cart.component';
import { OrderComponent } from './main/order/order.component';
import { redirectLoggedInTo, redirectUnauthorizedTo, AngularFireAuthGuard } from '@angular/fire/auth-guard';

const redirectLoggedInToProfile = () => redirectLoggedInTo(["profile"]); //To resolve: https://github.com/angular/angularfire/issues/2099
const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(["login"]);

const routes: Routes = [
    { path: '', redirectTo: "/shop", pathMatch: 'full'},
    { path: 'login', component: LoginComponent, canActivate: [AngularFireAuthGuard], data: { title: 'Логовање', authGuardPipe: redirectLoggedInToProfile } },
    { path: 'registration', component: RegistrationComponent, canActivate: [AngularFireAuthGuard], data: { title: 'Регистрација', authGuardPipe: redirectLoggedInToProfile } },
    { path: 'profile', component: ProfilePageComponent, canActivate: [AngularFireAuthGuard], data: { title: 'Профил', authGuardPipe: redirectUnauthorizedToLogin } },
    { path: 'shop', component: ShopComponent, data: { title: 'Продавница' } },
    { path: 'cart', component: CartComponent, canActivate: [AngularFireAuthGuard], data: { title: 'Корпа', authGuardPipe: redirectUnauthorizedToLogin } },
    { path: 'order', component: OrderComponent, canActivate: [AngularFireAuthGuard], data: { title: 'Поруџбине', authGuardPipe: redirectUnauthorizedToLogin } },
    { path: '**', component: NotFoundComponent, data: { title: 'Грешка 404' } }
];

@NgModule({
    imports: [
        RouterModule.forRoot(routes, /* { enableTracing: true } */)
    ],
    exports: [
        RouterModule
    ]
})

export class RoutingModule { }