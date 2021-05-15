import { environment } from '../environments/environment';
import { NgModule } from '@angular/core';
import { BrowserModule, Title } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { LoginComponent } from './auth/login/login.component';
import { RegistrationComponent } from './auth/registration/registration.component';
import { MaterialModule } from './material.module';
import { RoutingModule } from './routing.module';
import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { CryptoService } from './auth/crypto/crypto.service';
import { RegistrationSuccessDialogComponent } from './popupDialogs/registration-success-dialog/registration-success-dialog.component';
import { LoginSuccessDialogComponent } from './popupDialogs/login-success-dialog/login-success-dialog.component';
import { LoginFailedDialogComponent } from './popupDialogs/login-failed-dialog/login-failed-dialog.component';
import { ProfilePageComponent } from './main/profile-page/profile-page.component';
import { RegistrationFailedDialogComponent } from './popupDialogs/registration-failed-dialog/registration-failed-dialog.component';
import { ShopComponent } from './main/shop/shop.component';
import { CartComponent } from './main/cart/cart.component';
import { OrderComponent } from './main/order/order.component';
import { NotFoundComponent } from './main/not-found/not-found.component';
import { FirebaseService } from './auth/firebase/firebase.service';
import { AngularFireAuthGuard } from '@angular/fire/auth-guard';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { NgxSliderModule } from '@angular-slider/ngx-slider';
import { FishDemoComponent } from './fish-demo/fish-demo.component';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegistrationComponent,
    RegistrationSuccessDialogComponent,
    LoginSuccessDialogComponent,
    LoginFailedDialogComponent,
    ProfilePageComponent,
    RegistrationFailedDialogComponent,
    ShopComponent,
    CartComponent,
    OrderComponent,
    NotFoundComponent,
    FishDemoComponent
  ],
  imports: [
    BrowserModule,
    MaterialModule,
    RoutingModule,
    BrowserAnimationsModule,
    FlexLayoutModule,
    FormsModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule,
    AngularFireStorageModule,
    NgxSliderModule,
    HttpClientModule
  ],
  providers: [Title, CryptoService, FirebaseService, AngularFireAuthGuard, IDBDatabase, IDBFactory],
  bootstrap: [AppComponent]
})
export class AppModule { }
