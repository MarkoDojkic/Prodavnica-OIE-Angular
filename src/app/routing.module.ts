import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { LoginComponent } from "./auth/login/login.component";
import { RegistrationComponent } from "./auth/registration/registration.component";
import { ProfilePageComponent } from "./main/profile-page/profile-page.component";

const routes: Routes = [
    { path: 'login', component: LoginComponent, data: { title: 'Логовање' } },
    { path: 'registration', component: RegistrationComponent, data: { title: 'Регистрација' } },
    { path: 'profilePage', component: ProfilePageComponent, data: { title: 'Профил' } },
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