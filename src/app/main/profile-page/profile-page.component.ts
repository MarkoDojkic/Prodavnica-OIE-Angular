import { FirebaseService } from './../../auth/firebase/firebase.service';
import { AbstractControl, NgForm, NgModel } from '@angular/forms';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-profile-page',
  templateUrl: './profile-page.component.html',
  styleUrls: ['./profile-page.component.css']
})
export class ProfilePageComponent implements OnInit {

  uid: string;
  userName: string;
  userSurname: string;
  userEmail: string;
  userPhone: string;
  userMobilePhone: string;
  userDeliveryAddress: string;
  userDeliveryAddressPAK: string;
  userPaymentAddress: string;
  userPaymentType: Number;
  paymentPattern: string;
  paymentHint: string;
  paymentErrorMessage: string;

  constructor(private fs:FirebaseService) { }

  ngOnInit(): void { this.updateFieldData(); }

  checkPasswordRepeat(pass: NgModel, repeatPass: NgModel): void {
    if (pass.value != repeatPass.value) repeatPass.control.setErrors({ "matched": true });
    else repeatPass.control.setErrors(null);
  }

  onUpdate(form: NgForm): void {

    var newName: string = form.controls["name"].value;
    var newSurname: string = form.controls["surname"].value;
    var updatedFirestoreData: any = {};

    console.log();
    
    this.fs.updateAuthUserProfile(((!!newName ? newName : this.userName) + " "
    + (!!newSurname ? newSurname : this.userSurname)), null);
        
    Object.keys(form.controls).forEach(control => {
      var field: AbstractControl = form.controls[control];
      if (field.dirty && field.valid && control !== "name" && control !== "surname"
        && control !== "email" && control !== "password" && control != "passwordRepeat") {
        updatedFirestoreData[control] = field.value;
        setTimeout(() => { field.reset(); }, 1500);
      }
    });

    this.fs.updateFirestoreData(this.uid, updatedFirestoreData);
    
    setTimeout(() => {
      form.controls["name"].reset();
      form.controls["surname"].reset();
      form.controls["email"].reset();
      form.controls["password"].reset();
      form.controls["passwordRepeat"].reset();
      this.updateFieldData();
    }, 1000);
  }
  
  onFormReset(form: NgForm): void {
    form.reset();
  }

  async updateFieldData() {
    const ibData: Promise<any> = this.fs.getIDBData();
    ibData.then(() => {
      this.uid = ibData["__zone_symbol__value"]["uid"];
      this.userName = ibData["__zone_symbol__value"]["displayName"].split(' ')[0];
      this.userSurname = ibData["__zone_symbol__value"]["displayName"].split(' ')[1];
      this.userEmail = ibData["__zone_symbol__value"]["email"];

      this.fs.getFirestoreData(this.uid).forEach((data) => {
        this.userPhone = data.get("phone");
        this.userMobilePhone = data.get("mobilePhone");
        this.userDeliveryAddress = data.get("deliveryAddress");
        this.userDeliveryAddressPAK = data.get("deliveryAddressPAK");
        this.userPaymentAddress = data.get("paymentAddress");
        this.userPaymentType = data.get("paymentType");
      });
    })
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
