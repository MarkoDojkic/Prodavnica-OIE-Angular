import { FirebaseService } from './../../auth/firebase/firebase.service';
import { MatDialog } from '@angular/material/dialog';
import { AbstractControl, NgForm, NgModel } from '@angular/forms';
import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { LocalStorageService } from 'ngx-webstorage';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireAuth } from '@angular/fire/auth';

@Component({
  selector: 'app-profile-page',
  templateUrl: './profile-page.component.html',
  styleUrls: ['./profile-page.component.css']
})
export class ProfilePageComponent implements OnInit {

  userName: String;
  userSurname: String;
  userEmail: String;
  userPhone: String;
  userMobilePhone: String;
  userDeliveryAddress: String;
  userDeliveryAddressPAK: String;
  userPaymentAddress: String;
  userPaymentType: Number;
  paymentPattern: String;
  paymentHint: String;
  paymentErrorMessage: String;

  constructor(private fs:FirebaseService,
    private localStorageS: LocalStorageService) { }

  ngOnInit(): void {

    const userDataJSON = JSON.parse(this.localStorageS.retrieve("loggedInUser"));
    const userDataFirestoreObservable = this.fs.getFirestoreData(userDataJSON["uid"]);

    this.userName = userDataJSON["displayName"].split(' ')[0];
    this.userSurname = userDataJSON["displayName"].split(' ')[1];
    this.userEmail = userDataJSON["email"];

    userDataFirestoreObservable.forEach((data) => {
      this.userPhone = data.get("phone");
      this.userMobilePhone = data.get("mobilePhone");
      this.userDeliveryAddress = data.get("deliveryAddress");
      this.userDeliveryAddressPAK = data.get("deliveryAddressPAK");
      this.userPaymentAddress = data.get("paymentAddress");
      this.userPaymentType = data.get("paymentType");
    })
  }

  checkPasswordRepeat(pass: NgModel, repeatPass: NgModel): void {
    if (pass.value != repeatPass.value) repeatPass.control.setErrors({ "matched": true });
    else repeatPass.control.setErrors(null);
  }

  onUpdate(form: NgForm): void {

    var newDisplayName: string = null;
    var updatedFirestoreData: Map<string, any> = new Map<string, any>();

    if (form.controls["name"].valid) { //Needs fixing
      if (form.controls["surname"].valid)
        newDisplayName = form.controls["name"].value + " " + form.controls["surname"].value;
      else
        newDisplayName = form.controls["name"].value + " " + this.userSurname;
    } else if (form.controls["surname"].valid)
        newDisplayName = this.userName + " " + form.controls["surname"].value;
    
    console.log(newDisplayName);
    
    /* if (newDisplayName !== null)
      this.fs.updateAuthUserProfile(newDisplayName, null); */
    
    Object.keys(form.controls).forEach(control => {
      var field: AbstractControl = form.controls[control];
      if (field.dirty && field.valid && control !== "name" && control !== "surname"
        && control !== "email" && control !== "password" && control != "passwordRepeat") {
        updatedFirestoreData.set(control, field.value);
      }
    });

    this.fs.updateFirestoreData
      (JSON.parse(this.localStorageS.retrieve("loggedInUser"))["uid"],
        Object.assign({}, updatedFirestoreData)); //To be fixed (does nothing)
    
    
    /* var newDisplayName: string = null;
    var isUpdateSuccesfull: Boolean = true;

    if (form.controls["name"].valid) {
      if (form.controls["surname"].valid)
        newDisplayName = form.controls["name"].value + " " + form.controls["surname"].value;
      else
        newDisplayName = form.controls["name"].value + " " + this.userSurname;
    } else if (form.controls["surname"].valid)
        newDisplayName = this.userName + " " + form.controls["surname"].value ;
    
    if (newDisplayName !== null) {
      this.auth.user.subscribe(user => {
        user.updateProfile({
          displayName: newDisplayName
        }).catch((error) => {
          console.log("AuthProfileUpdateError: " + error);
          isUpdateSuccesfull = false;
        })
      });
    }

    Object.keys(form.controls).forEach(control => {
      var field: AbstractControl = form.controls[control];
      if (field.dirty && field.valid && control !== "name" && control !== "surname"
            && control !== "email" && control !== "password" && control != "passwordRepeat") {
        this.firestore.collection("users").doc(this.localStorageS.retrieve("loggedInUserId")).update({
          [control]: field.value
        }).catch((error) => {
          console.log([control] + "UpdateError: " + error);
          isUpdateSuccesfull = false;
        });
      }
    });
    
    if (isUpdateSuccesfull) this.dialog.open(UpdateProfileSuccessDialogComponent);
    else this.dialog.open(UpdateProfileFailedDialogComponent); */
  }

  onFormReset(form: NgForm): void {
    form.reset();
  }

  updatePaymentAddressInput(paymentType: Number) {
    switch (paymentType) {
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
