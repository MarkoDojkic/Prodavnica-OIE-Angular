import { FirebaseService } from '../../services/firebase/firebase.service';
import { AbstractControl, NgForm, NgModel, FormControl } from '@angular/forms';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { map, startWith } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';

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
  userPaymentType: number;
  paymentPattern: string;
  paymentHint: string;
  paymentErrorMessage: string; fac
  favoriteProducts: Array<string> = new Array<string>();
  avaiableFavoriteProducts: Array<string> = ["Монокристални соларни панели", "Поликристални соларни панели",
    "Аморфни соларни панели", "Електрична возила", "PWM контролери пуњења акумулатора",
    "MPPT контролери пуњења акумулатора", "OFF-Grid инвертори", "ON-Grid инвертори", "Хибридни инвертори",
    "Хоризонтални ветрогенератори", "Вертикални ветрогенератори", "Оловни акумулатори",
    "Никл базирани акумулатори", "Литијумски акумулатори", "Специјални акумулатори"];
  filteredFavoriteProducts: Observable<Array<string>> = new Observable<Array<string>>();
  favoriteProductsInputControl: FormControl = new FormControl();

  @ViewChild("favoriteProductInput") favoriteProductInput: ElementRef<HTMLInputElement>;

  constructor(private fs:FirebaseService) { }

  ngOnInit(): void {
    setTimeout(() => {
      this.updateFieldData();
    }, 1000); /* To give time for firebaseLocalStorageDb to be opened by service */

    this.filteredFavoriteProducts = this.favoriteProductsInputControl.valueChanges
      .pipe(map((favoriteProduct: string | null) => favoriteProduct ? this.avaiableFavoriteProducts.filter(avaiableFavoriteProduct =>
        avaiableFavoriteProduct.toLowerCase().indexOf(favoriteProduct.toLowerCase()) === 0) : this.avaiableFavoriteProducts.slice())
    );
  }

  checkPasswordRepeat(pass: NgModel, repeatPass: NgModel): void {
    if (pass.value != repeatPass.value) repeatPass.control.setErrors({ "matched": true });
    else repeatPass.control.setErrors(null);
  }

  onUpdate(form: NgForm): void {
    const newName: string = (form.controls["name"].valid && form.controls["name"].dirty) ? form.controls["name"].value : this.userName;
    const newSurname: string = (form.controls["surname"].valid && form.controls["surname"].dirty) ? form.controls["surname"].value : this.userSurname;
    const updatedFirestoreData: any = {};
    
    if (!newName.includes(this.userName) || !newSurname.includes(this.userSurname))
      this.fs.updateAuthUserProfile(newName + " " + newSurname, null);
        
    Object.keys(form.controls).forEach(control => {
      const field: AbstractControl = form.controls[control];
      if (field.dirty && field.valid && control !== "email" && control !== "password" && control != "passwordRepeat") {
        updatedFirestoreData[control] = field.value;
        setTimeout(() => { field.reset(); }, 1500); /* To give time to firestore to update */
      }
    });

    if (form.controls["email"].dirty && form.controls["email"].valid) {
      this.fs.updateUserEmail(form.controls["email"].value);
      form.controls["email"].reset();
      return;
    }

    if (form.controls["password"].dirty && form.controls["password"].valid
          && form.controls["password"].value === form.controls["passwordRepeat"].value) {
      this.fs.updateUserPassword(form.controls["password"].value);
      form.controls["password"].reset();
      form.controls["passwordRepeat"].reset();
      return;
    }

    updatedFirestoreData["favoriteProducts"] = this.favoriteProducts;

    this.fs.updateFirestoreUserData(this.uid, updatedFirestoreData);

    form.controls["name"].reset();
    form.controls["surname"].reset();
    form.controls["email"].reset();
    form.controls["password"].reset();
    form.controls["passwordRepeat"].reset();

    this.updateFieldData();
  }

  updateFieldData() {
    this.fs.getIDBData().subscribe(ibData => {
      this.uid = ibData["value"]["uid"];
      this.userName = ibData["value"]["displayName"].split(' ')[0];
      this.userSurname = ibData["value"]["displayName"].split(' ')[1];
      this.userEmail = ibData["value"]["email"];

      this.fs.getFirestoreUserData(this.uid).subscribe(data => { //Assumes valid return from firestore database
        this.userPhone = data.get("phone");
        this.userMobilePhone = data.get("mobilePhone");
        this.userDeliveryAddress = data.get("deliveryAddress");
        this.userDeliveryAddressPAK = data.get("deliveryAddressPAK");
        this.userPaymentAddress = data.get("paymentAddress");
        this.userPaymentType = data.get("paymentType");
        this.favoriteProducts = data.get("favoriteProducts");
      });
    });
  }

  updatePaymentAddressInput(paymentType: number) {
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

  addSelectedFavoriteProduct(event: MatAutocompleteSelectedEvent): void {
    var selectedFavoriteProduct: string = this.avaiableFavoriteProducts.find(favoriteProduct => event.option.viewValue.startsWith(favoriteProduct, 0));
    if(!this.favoriteProducts.includes(selectedFavoriteProduct, 0))
      this.favoriteProducts.push(selectedFavoriteProduct);
    this.favoriteProductsInputControl.setValue("", { emitEvent: true }); //emitEvent: true will fire valueChanges
    this.favoriteProductInput.nativeElement.value = "";
  }

  removeSelectedFavoriteProduct(selectedFavoriteProduct: string): void {
    const index = this.favoriteProducts.indexOf(selectedFavoriteProduct);
    this.favoriteProducts.splice(index, 1);
  }
}