import { CryptoService } from './../crypto/crypto.service';
import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { FormGroup, NgForm, NgModel } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { RegistrationSuccessDialogComponent } from 'src/app/popupDialogs/registration-success-dialog/registration-success-dialog.component';
import { RegistrationFailedDialogComponent } from 'src/app/popupDialogs/registration-failed-dialog/registration-failed-dialog.component';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css']
})
  
export class RegistrationComponent implements OnInit {

  paymentPattern: String;
  paymentHint: String;
  paymentErrorMessage: String;

  constructor(private auth: AngularFireAuth,private firestore: AngularFirestore, private cs: CryptoService, private dialog: MatDialog) { }

  ngOnInit(): void {
    this.paymentPattern = this.paymentHint = this.paymentErrorMessage = null;
  }

  onRegister(form: NgForm): void {
    this.auth.createUserWithEmailAndPassword(form.controls["email"].value, this.cs.encrypt("y/B?E(H+MbQeThWmYq3t6w9z$C&F)J@NcRfUjXn2r4u7x!A%D*G-KaPdSgVkYp3s6v8y/B?E(H+MbQeThWmZq4t7w!z$C&F)J@NcRfUjXn2r5u8x/A?D*G-KaPdSgVkY",
        form.controls["password"].value)).then((result) => {
          /* result.user.sendEmailVerification(); */
          this.firestore.firestore.runTransaction(() => {
            return this.firestore.collection("users").doc(result.user.uid).set({
              "name": form.controls["name"].value,
              "surname": form.controls["surname"].value,
              "phone": form.controls["phone"].hasError('required') ? '' : form.controls["phone"].value,
              "mobilePhone": form.controls["mobilePhone"].hasError('required') ? '' : form.controls["mobilePhone"].value,
              "address": form.controls["deliveryAddress"].hasError('required') ? '' : form.controls["deliveryAddress"].value,
              "addressPAK": form.controls["deliveryAddressPAK"].hasError('required') ? '' : form.controls["deliveryAddressPAK"].value,
              "paymentId": form.controls["paymentType"].value,
              "paymentAddress": form.controls["paymentAddress"].value
            })
          }).then(() => { this.dialog.open(RegistrationSuccessDialogComponent); })
    }).catch((error) => {
      console.log(error);
      this.dialog.open(RegistrationFailedDialogComponent);
      return;
    })
  }

  onFormReset(form: NgForm): void {
    form.reset();
  }

  checkRequiredFields(form: FormGroup): Boolean {
    var isAllValid: Boolean = true;
    Object.keys(form.controls).forEach(id => {
      if(form.controls[id].hasError('required')) isAllValid = false;
    });
    return isAllValid;
  }

  checkPasswordRepeat(pass: NgModel, repeatPass: NgModel): void {
    if (pass.value != repeatPass.value) repeatPass.control.setErrors({ "matched": true });
    else repeatPass.control.setErrors(null);
  }

  updatePaymentAddressInput(paymentId: Number) {
    switch (paymentId) {
      case 0:
        this.paymentPattern = "^(2|5)[1-5][0-9]{14}$"; //International pattern
        this.paymentHint = "Унесите број Ваше МasterCard картице, пр. 5347240348201433";
        this.paymentErrorMessage = "Број МasterCard картице није исправан";
        break;
      case 1:
        this.paymentPattern = "^(?:4[0-9]{12}(?:[0-9]{3})?)$";
        this.paymentHint = "Унесите број Ваше Visa картице, пр. 4012888888881881";
        this.paymentErrorMessage = "Број Visa картице није исправан";
        break;
      case 2:
        this.paymentPattern = "^(?:3[47][0-9]{13})$";
        this.paymentHint = "Унесите број Ваше American Express картице, пр. 371449635398431";
        this.paymentErrorMessage = "Број American Express картице није исправан";
        break;
      case 3:
        this.paymentPattern = "^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$";
        this.paymentHint = "Унесите адресу Вашег Bitcoin новчаника, пр. 3FZbgi29cpjq2GjdwV8eyHuJJnkLtktZc5";
        this.paymentErrorMessage = "Адреса Bitcoin новчаника није исправна";
        break;
      case 4:
        this.paymentPattern = "^0x[a-fA-F0-9]{40}$";
        this.paymentHint = "Унесите адресу Вашег Ethereum новчаника, пр. 0x89205A3A3b2A69De6Dbf7f01ED13B2108B2c43e7";
        this.paymentErrorMessage = "Адреса Ethereum новчаника није исправна";
        break;
      case 5:
        this.paymentPattern = "^4[0-9AB][1-9A-HJ-NP-Za-km-z]{93}$";
        this.paymentHint = "Унесите адресу Вашег Monero новчаника, пр. 4А и онда 93 карактера";
        this.paymentErrorMessage = "Адреса Monero новчаника није исправна";
        break;
      default:
        this.paymentPattern = null;
        this.paymentHint = null;
        this.paymentErrorMessage = null;
    }
  }

}