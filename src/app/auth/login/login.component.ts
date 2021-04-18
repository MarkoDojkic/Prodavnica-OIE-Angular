import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { NgForm } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { LoginFailedDialogComponent } from 'src/app/popupDialogs/login-failed-dialog/login-failed-dialog.component';
import { LoginSuccessDialogComponent } from 'src/app/popupDialogs/login-success-dialog/login-success-dialog.component';
import { CryptoService } from '../crypto/crypto.service';
import * as accounts from './../../../assets/accounts.json';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  constructor(private firestore: AngularFirestore, private cs: CryptoService, private dialog: MatDialog) { }

  ngOnInit(): void {
  }

  onLogin(form: NgForm): void {
    const accountObject: any = (accounts as any).default.find(user => user.email === form.controls["email"].value);
    if (accountObject === undefined) { console.log("User not existant"); return; }
    this.firestore.collection("users").doc(accountObject.firestoreId).get().subscribe((document) => {
      if (document.exists) {
        if (this.cs.decrypt("y/B?E(H+MbQeThWmYq3t6w9z$C&F)J@NcRfUjXn2r4u7x!A%D*G-KaPdSgVkYp3s6v8y/B?E(H+MbQeThWmZq4t7w!z$C&F)J@NcRfUjXn2r5u8x/A?D*G-KaPdSgVkY",
          document.data()["password"]).match(form.controls["password"].value)) {
            sessionStorage.setItem("loggedInUserId", accountObject.firestoreId);
            this.dialog.open(LoginSuccessDialogComponent);
          }
        else this.dialog.open(LoginFailedDialogComponent);
      }
    });
  }

  onFormReset(form: NgForm): void {
    form.reset();
  }

}
