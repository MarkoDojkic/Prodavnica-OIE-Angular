import { RegistrationSuccessDialogComponent } from 'src/app/popupDialogs/registration-success-dialog/registration-success-dialog.component';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { User } from './user';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore, DocumentSnapshot } from '@angular/fire/firestore';
import { Injectable, NgZone } from '@angular/core';
import { LocalStorageService } from 'ngx-webstorage';
import { MatDialog } from '@angular/material/dialog';
import { CryptoService } from '../crypto/crypto.service';
import { RegistrationFailedDialogComponent } from 'src/app/popupDialogs/registration-failed-dialog/registration-failed-dialog.component';
import { LoginFailedDialogComponent } from 'src/app/popupDialogs/login-failed-dialog/login-failed-dialog.component';
import { LoginSuccessDialogComponent } from 'src/app/popupDialogs/login-success-dialog/login-success-dialog.component';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
  
export class FirebaseService {

  //https://www.positronx.io/full-angular-7-firebase-authentication-system/

  public loggedInUserData: User;
  private key: string = "y/B?E(H+MbQeThWmYq3t6w9z$C&F)J@NcRfUjXn2r4u7x!A%D*G-KaPdSgVkYp3s6v8y/B?E(H+MbQeThWmZq4t7w!z$C&F)J@NcRfUjXn2r5u8x/A?D*G-KaPdSgVkY";

  constructor(public firestore: AngularFirestore, public auth: AngularFireAuth,
    public ngZone: NgZone, private localStorageS: LocalStorageService, private router: Router,
    private cs: CryptoService, private dialog: MatDialog) {
    this.auth.authState.subscribe(user => {
      if (user) {
        this.loggedInUserData = user;
        this.localStorageS.store("loggedInUser", JSON.stringify(this.loggedInUserData));
      } else this.localStorageS.clear("loggedInUser");
    });
  }

  signInViaEmail(email: string, password: string): Promise<any> {
    return this.auth.signInWithEmailAndPassword(email, this.cs.encrypt(this.key, password)).then((result) => {
      this.ngZone.run(() => { this.router.navigate(["/profile"]); });
      this.loggedInUserData = result.user;
      this.localStorageS.store("loggedInUser", JSON.stringify(this.loggedInUserData));
    }).then(() => {
      this.dialog.open(LoginSuccessDialogComponent);
    }).catch((error) => {
      console.log(error);
      this.dialog.open(LoginFailedDialogComponent);
    });
  }

  signUpViaEmail(email: string, password: string, form: NgForm): Promise<void> {
    return this.auth.createUserWithEmailAndPassword(email, this.cs.encrypt(this.key, password)).then((result) => {
      /* result.user.sendEmailVerification(); */
      this.updateAuthUserProfile((form.controls["name"].value + " " + form.controls["surname"].value), null);
      this.updateFirestoreData(result.user.uid, {
        "phone": form.controls["phone"].hasError('required') ? '' : form.controls["phone"].value,
        "mobilePhone": form.controls["mobilePhone"].hasError('required') ? '' : form.controls["mobilePhone"].value,
        "deliveryAddress": form.controls["deliveryAddress"].hasError('required') ? '' : form.controls["deliveryAddress"].value,
        "deliveryAddressPAK": form.controls["deliveryAddressPAK"].hasError('required') ? '' : form.controls["deliveryAddressPAK"].value,
        "paymentType": form.controls["paymentType"].value,
        "paymentAddress": form.controls["paymentAddress"].value
      });
    }).then(() => { this.signOut(); this.dialog.open(RegistrationSuccessDialogComponent); })
      .catch((error) => {
      console.log(error);
      this.dialog.open(RegistrationFailedDialogComponent);
    });
  }

  updateAuthUserProfile(displayName: string, photoURL: string): void {
    this.auth.user.subscribe((result) => {
      if (result) result.updateProfile({ displayName: displayName, photoURL: photoURL })
                  .catch((error) => { console.log("UpdateAuthUserProfile error: " + error)});
    });
  }

  updateFirestoreData(userId: string, data: any): void {
    this.firestore.firestore.runTransaction(() => {
      return this.firestore.collection("users").doc(userId)
        .update(data).catch((error) => { console.log(error); });
    });
  }

  getFirestoreData(userId: string): Observable<any> {
    return this.firestore.collection("users").doc(userId).get();
  }

  get isUserLoggedIn(): boolean {
    return this.localStorageS.retrieve("loggedInUser") ? true : false;
  }

  signOut(): void {
    this.auth.signOut().then(() => {
      this.localStorageS.clear("loggedInUser");
      this.router.navigate(["login"]);
    })
  }
}
