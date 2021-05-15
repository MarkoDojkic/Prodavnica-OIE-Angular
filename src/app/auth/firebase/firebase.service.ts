import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { Injectable, NgZone } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CryptoService } from '../crypto/crypto.service';
import { Observable } from 'rxjs';
import { Item } from 'src/app/main/shop/shop.component';
import { AngularFireStorage } from '@angular/fire/storage';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
  
export class FirebaseService {

  //https://www.positronx.io/full-angular-7-firebase-authentication-system/

  private key: string = "y/B?E(H+MbQeThWmYq3t6w9z$C&F)J@NcRfUjXn2r4u7x!A%D*G-KaPdSgVkYp3s6v8y/B?E(H+MbQeThWmZq4t7w!z$C&F)J@NcRfUjXn2r5u8x/A?D*G-KaPdSgVkY";
  private firebaseLocalDB: IDBDatabase;
  private isLoggedIn: boolean;

  constructor(private firestore: AngularFirestore, private auth: AngularFireAuth,
    private ngZone: NgZone, private router: Router, private storage: AngularFireStorage,
    private cs: CryptoService, private dialog: MatDialog) {
      var openIDB = window.indexedDB.open("firebaseLocalStorageDb", 1);
      openIDB.onsuccess = () => {
        this.firebaseLocalDB = openIDB.result;
      };
      openIDB.onerror = error => {
        console.log("Error while opening firebaseLocalDB: " + error);
      };
    }

  signInViaEmail(email: string, password: string): Promise<any> {
    return this.auth.signInWithEmailAndPassword(email, this.cs.encrypt(this.key, password))
    .then((result) => {}).then(() => {
      Swal.fire({
        title: "Логовање успешно!",
        text: "Успешно сте се улоговали!",
        icon: "success",
        showCancelButton: false,
        confirmButtonText: "У реду",
      }).then(() => {
        this.ngZone.run(() => { this.router.navigate(["/profile"]); });
        this.isLoggedIn = true;
      });
    }).catch((error) => {
      console.log(error);
      Swal.fire({
        title: "Логовање неуспешно!",
        text: "Проверите поново да ли сте исправно унели\nВашу адресу електронске поште и лозинку!",
        icon: "error",
        showCancelButton: false,
        confirmButtonText: "У реду",
      })
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
    }).then(() => {
      this.signOut();
      Swal.fire({
        title: "Регистрација успешна!",
        text: "Успешно сте креирали нови налог.\nСада се можете улоговати\nса унетом адресом електронске поште и лозинком.\nНакон изласка бићете\nпреусмерени на страницу за логовање!",
        icon: "success",
        showCancelButton: false,
        confirmButtonText: "У реду",
      }).then(() => {
        this.ngZone.run(() => { this.router.navigate(["/profile"]); });
        this.isLoggedIn = true;
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
    this.auth.user.subscribe((result) => {
      if (result) result.updateProfile({ displayName: displayName, photoURL: photoURL })
        .catch((error) => { console.log("UpdateAuthUserProfile error: " + error) });
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

  getIDBData(): Promise<any> {
    this.isLoggedIn = true;
    return new Promise<any>((resolve, reject) => {
      const gettingData = this.firebaseLocalDB.transaction('firebaseLocalStorage', 'readonly').objectStore("firebaseLocalStorage").get(IDBKeyRange.lowerBound(0));
      gettingData.onsuccess = () => {
        resolve(gettingData.result["value"]);
      }
  
      gettingData.onerror = (error) => {
        reject(Error("Error while getting idb data: " + error));
      }
    });
  }

  get isUserLoggedIn(): boolean {
    return this.isLoggedIn;
  }

  signOut(): void {
    this.auth.signOut().then(() => {
      this.isLoggedIn = false;
      this.router.navigate(["login"])
    });
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

  private retriveImageURL(imageName: string): Observable<string | null> {
    return this.storage.ref("items/" + imageName + ".png").getDownloadURL();
  }
}