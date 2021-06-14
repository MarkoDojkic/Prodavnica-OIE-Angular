import { environment } from '../environments/environment';
import { NgModule } from '@angular/core';
import { BrowserModule, Title } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from './material.module';
import { RoutingModule } from './routing.module';
import { AngularFireModule } from '@angular/fire';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { NgxSliderModule } from '@angular-slider/ngx-slider';
import { NotifierModule } from 'angular-notifier';

import { AppComponent } from './app.component';
import { LoginComponent } from './auth/login/login.component';
import { RegistrationComponent } from './auth/registration/registration.component';
import { CryptoService } from './services/crypto/crypto.service';
import { ProfilePageComponent } from './main/profile-page/profile-page.component';
import { ShopComponent } from './main/shop/shop.component';
import { CartComponent } from './main/cart/cart.component';
import { OrderComponent } from './main/order/order.component';
import { NotFoundComponent } from './main/not-found/not-found.component';
import { FirebaseService } from './services/firebase/firebase.service';
import { AngularFireAuthGuard } from '@angular/fire/auth-guard';
import { getSerbianPaginatorIntl } from './services/MatPaginatorLocalization';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { DatePipe } from '@angular/common';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegistrationComponent,
    ProfilePageComponent,
    ShopComponent,
    CartComponent,
    OrderComponent,
    NotFoundComponent
  ],
  imports: [
    BrowserModule,
    MaterialModule,
    RoutingModule,
    BrowserAnimationsModule,
    FlexLayoutModule,
    FormsModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireStorageModule,
    NgxSliderModule,
    ReactiveFormsModule,
    NotifierModule.withConfig({
      position: {
        horizontal: {
          position: 'right',
          distance: 12
        },
        vertical: {
          position: 'top',
          distance: 12,
          gap: 10
        }
      },
      theme: 'material',
      behaviour: {
        autoHide: 3000,
        onClick: 'hide',
        onMouseover: 'pauseAutoHide',
        showDismissButton: true,
        stacking: 8
      },
      animations: {
        enabled: true,
        show: {
          preset: 'slide',
          speed: 300,
          easing: 'ease'
        },
        hide: {
          preset: 'fade',
          speed: 300,
          easing: 'ease',
          offset: 50
        },
        shift: {
          speed: 300,
          easing: 'ease'
        },
        overlap: 150
      }
    }),
  ],

  
  providers: [Title, CryptoService, FirebaseService, AngularFireAuthGuard, DatePipe,
    IDBDatabase, IDBFactory, { provide: MatPaginatorIntl, useValue: getSerbianPaginatorIntl() }],
  bootstrap: [AppComponent]
})
export class AppModule { }
