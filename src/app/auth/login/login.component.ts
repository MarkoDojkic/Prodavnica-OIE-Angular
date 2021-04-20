import { AngularFireAuth } from '@angular/fire/auth';
import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { LoginFailedDialogComponent } from 'src/app/popupDialogs/login-failed-dialog/login-failed-dialog.component';
import { LoginSuccessDialogComponent } from 'src/app/popupDialogs/login-success-dialog/login-success-dialog.component';
import { CryptoService } from '../crypto/crypto.service';
import { LocalStorageService } from 'ngx-webstorage';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  constructor(private auth: AngularFireAuth,
              private cs: CryptoService,
              private dialog: MatDialog,
              private localStorageS: LocalStorageService) { }

  ngOnInit(): void {
  }

  onLogin(form: NgForm): void {
    this.auth.signInWithEmailAndPassword(form.controls["email"].value, this.cs.encrypt("y/B?E(H+MbQeThWmYq3t6w9z$C&F)J@NcRfUjXn2r4u7x!A%D*G-KaPdSgVkYp3s6v8y/B?E(H+MbQeThWmZq4t7w!z$C&F)J@NcRfUjXn2r5u8x/A?D*G-KaPdSgVkY",
      form.controls["password"].value)).then((result) => {
        this.localStorageS.store("loggedInUserId", result);
        this.dialog.open(LoginSuccessDialogComponent);
      }).catch((error) => {
        console.log(error);
        this.dialog.open(LoginFailedDialogComponent);
    });
  }

  onFormReset(form: NgForm): void {
    form.reset();
  }
}
