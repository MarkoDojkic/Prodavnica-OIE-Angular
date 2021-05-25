import { IndexedDatabaseService } from './../../main/indexed-database/indexed-database.service';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { Injectable, NgZone } from '@angular/core';
import { CryptoService } from '../crypto/crypto.service';
import { Observable } from 'rxjs';
import { Item } from 'src/app/main/shop/shop.component';
import { AngularFireStorage } from '@angular/fire/storage';
import Swal from 'sweetalert2';
import * as firebase from 'firebase';

@Injectable({
  providedIn: 'root'
})
  
export class FirebaseService {

  //https://www.positronx.io/full-angular-7-firebase-authentication-system/
  firebaseApplication = firebase.default;
  key: string = "y/B?E(H+MbQeThWmYq3t6w9z$C&F)J@NcRfUjXn2r4u7x!A%D*G-KaPdSgVkYp3s6v8y/B?E(H+MbQeThWmZq4t7w!z$C&F)J@NcRfUjXn2r5u8x/A?D*G-KaPdSgVkY";
  firebaseLocalStorageDb: string = "firebaseLocalStorageDb";
  userId: string = null;
  

  constructor(private firestore: AngularFirestore, private auth: AngularFireAuth,
    private ngZone: NgZone, private router: Router, private storage: AngularFireStorage,
    private idb: IndexedDatabaseService, private cs: CryptoService) {
      setTimeout(() => {
        this.idb.openIDB(this.firebaseLocalStorageDb, 1);
      }, 1000); /* This timeout is added to give firebase time to create firebaseLocalStorageDb, if not done already */
      this.updateLoggedInUserId();
    }

  signInViaEmail(email: string, password: string): void {
    this.auth.signInWithEmailAndPassword(email, this.cs.encrypt(this.key, password))
      .then(/* result => { console.log(result); } */).then(() => {
      Swal.fire({
        title: "Логовање успешно!",
        text: "Успешно сте се улоговали!",
        icon: "success",
        showCancelButton: false,
        confirmButtonText: "У реду",
      }).then(() => {
        this.ngZone.run(() => { this.router.navigate(["/profile"]); });
        this.updateLoggedInUserId();
      });
    }).catch((error) => {
      /* console.log(error); */
      Swal.fire({
        title: "Логовање неуспешно!",
        text: "Проверите поново да ли сте исправно унели\nВашу адресу електронске поште и лозинку!",
        icon: "error",
        showCancelButton: false,
        confirmButtonText: "У реду",
      })
    });
  }

  signUpViaEmail(email: string, password: string, form: NgForm): void {
    this.auth.createUserWithEmailAndPassword(email, this.cs.encrypt(this.key, password)).then((result) => {
      /* result.user.sendEmailVerification(); */
      this.updateAuthUserProfile((form.controls["name"].value + " " + form.controls["surname"].value), null);
      this.updateFirestoreUserData(result.user.uid, {
        "phone": form.controls["phone"].hasError('required') ? '' : form.controls["phone"].value,
        "mobilePhone": form.controls["mobilePhone"].hasError('required') ? '' : form.controls["mobilePhone"].value,
        "deliveryAddress": form.controls["deliveryAddress"].hasError('required') ? '' : form.controls["deliveryAddress"].value,
        "deliveryAddressPAK": form.controls["deliveryAddressPAK"].hasError('required') ? '' : form.controls["deliveryAddressPAK"].value,
        "paymentType": form.controls["paymentType"].value,
        "paymentAddress": form.controls["paymentAddress"].value
      });
    }).then(() => {
      Swal.fire({
        title: "Регистрација успешна!",
        text: "Успешно сте креирали нови налог.\nСада се можете улоговати\nса унетом адресом електронске поште и лозинком.\nНакон изласка бићете\nпреусмерени на страницу за логовање!",
        icon: "success",
        showCancelButton: false,
        confirmButtonText: "У реду",
      }).then(() => {
        this.ngZone.run(() => { this.signOut(); });
      });
    }).catch((error) => {
      /* console.log(error); */
      Swal.fire({
        title: "Регистрација неуспешна!",
        text: "Највероватније већ постоји корисник са наведеном адресом електронске поште.\nУколико сте заборавили лознику затражите промену лозинке!",
        icon: "error",
        showCancelButton: false,
        confirmButtonText: "У реду",
      })
    });
  }

  updateAuthUserProfile(displayName: string, photoURL: string): void {
    this.auth.user.subscribe(result => {
      if (result) result.updateProfile({ displayName: displayName, photoURL: photoURL })
        .catch(/* (error) => { console.log("UpdateAuthUserProfile error: " + error) } */);
    });
  }

  updateFirestoreUserData(userId: string, data: any): void {
    this.firestore.firestore.runTransaction(() => {
      return this.firestore.collection("users").doc(userId)
        .update(data)
        .then(/* result => console.log(result) */)
        .catch(/* (error) => { console.log(error); } */);
    });
  }
  
  updateFirestoreOrderData(orderedItems: Array<Item>, shippingMethod: string, totalPrice: number): void {
    this.firestore.firestore.runTransaction(() => {
      return this.firestore.collection("orders").add({
        "orderedBy": this.loggedInUserId,
        "items": orderedItems,
        "shippingMethod": shippingMethod,
        "placedOn": this.firebaseApplication.firestore.FieldValue.serverTimestamp(),
        "totalPrice": totalPrice,
        "status": "Текућа",
        "comments": []
      }).then(result => console.log(result))
        .catch((error) => { console.log(error); });
    });
  }

  updateUserEmail(newEmail: string) {
    this.auth.user.subscribe(result => {
      /* if (result) result.updateEmail(newEmail); */
      Swal.fire({
        title: "Промена адресе електронске поште!",
        text: "Захтев за промену адресе електронске поште је послат на Вашу стару адресу!",
        icon: "warning",
        showCancelButton: false,
        confirmButtonText: "У реду",
      });
    });
  }

  updateUserPassword(newPassword: string) {
    this.auth.user.subscribe(result => {
      result.updatePassword(this.cs.encrypt(this.key, newPassword));
      Swal.fire({
        title: "Лозинка успешно промењена!",
        text: "Успешно сте променили лозинку! Ради сигурности сада ћете бити излоговани.",
        icon: "success",
        showCancelButton: false,
        confirmButtonText: "У реду",
      }).then(() => this.signOut());
    });
  }

  getFirestoreData(userId: string): Observable<any> {    
    return this.firestore.collection("users").doc(userId).get();
  }

  getIDBData(): Observable<any> {
    const output: Observable<number[]> = new Observable((observer) => {
      this.idb.getObjectStoreItem(this.idb.getIDB(this.firebaseLocalStorageDb),
      "firebaseLocalStorage", IDBKeyRange.lowerBound(0))
        .then(value => { observer.next(value[0]); })
        .catch(error => { observer.next(error); });

      return {
        unsubscribe() {
          observer.remove(observer);
        }
      }
    });

    return output;
  }

  get loggedInUserId(): string {
    return this.userId;
  }

  signOut(): void {
    this.auth.signOut().then(() => {
      this.userId = null;
      this.router.navigate(["login"])
    });
  }

  updateLoggedInUserId(): void {
    setTimeout(() => { /* Timeout to wait for database to be opened */
        const observable = this.getIDBData();
        if (observable === null) this.userId = null;
        else observable.subscribe(result => this.userId = result["value"]["uid"]);
    }, 2000);
  }

  getItemsByCategory(categoryName: string): Array<Item> {
    var categoryItems: Array<Item> = [];

    this.firestore.collection("items").ref
      .where("categoryName", "==", categoryName).get().then((querySnapshot) => {
        querySnapshot.forEach((item) => {
          categoryItems.push({
            "title": item.data()["name"],
            "imageUrl": this.retriveImageURL(item.id),
            "description": item.data()["description"],
            "leftInStock": item.data()["leftInStock"],
            "price":item.data()["price"]
          });
        });
      }).then(() => { return categoryItems; });
    return categoryItems;
  }

  retriveImageURL(imageName: string): Observable<string | null> {
    return this.storage.ref("items/" + imageName + ".png").getDownloadURL();
  }
}