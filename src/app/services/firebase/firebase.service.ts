import { Review } from '../../model/review.model';
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
import { IndexedDatabaseService } from '../indexed-database/indexed-database.service';
import { Order } from 'src/app/model/order.model';

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
      .then(/* resolve => { console.log(resolve); } */).then(() => {
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
    }).catch((reject) => {
      /* console.error(reject); */
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
      /* result.user.sendEmailVerification(); */ /* Commented for testing purposes, i.e. creation of dummy accounts */
      this.updateAuthUserProfile((form.controls["name"].value + " " + form.controls["surname"].value), null);
      this.updateFirestoreUserData(result.user.uid, {
        "name": form.controls["name"].value, /* For showing in reviews */
        "surname": form.controls["surname"].value, /* For showing in reviews */
        "phone": form.controls["phone"].hasError('required') ? '' : form.controls["phone"].value,
        "mobilePhone": form.controls["mobilePhone"].hasError('required') ? '' : form.controls["mobilePhone"].value,
        "deliveryAddress": form.controls["deliveryAddress"].hasError('required') ? '' : form.controls["deliveryAddress"].value,
        "deliveryAddressPAK": form.controls["deliveryAddressPAK"].hasError('required') ? '' : form.controls["deliveryAddressPAK"].value,
        "paymentType": form.controls["paymentType"].value,
        "paymentAddress": form.controls["paymentAddress"].value,
        "favoriteProducts": []
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
    }).catch((reject) => {
      /* console.error(reject); */
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
        .catch(/* reject => console.error(reject) */); /* Immediately visible results thus no need to display any messages */
    });
  }
  
  updateFirestoreUserData(userId: string, data: any): void {
    this.firestore.firestore.runTransaction(transaction =>
      transaction.get(this.firestore.collection("users").doc(userId).ref).then(document => {
        if (document.exists)
          transaction.update(document.ref, data);
        else
          transaction.set(document.ref, data);
    }).then( /* resolve => console.log(resolve) */)
      .catch( /* error => console.reject(reject) */)).then(/* result => console.log(result) */)
    .catch(/* reject => console.error(reject) */); /* Immediately visible results thus no need to display any messages */
  }
  
  placeOrder(orderedItems: Array<Item>, shippingMethod: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.getFirestoreUserData(this.loggedInUserId).subscribe(userData => {
        this.firestore.collection("orders").add({
          "orderedBy": this.loggedInUserId,
          "items": orderedItems.reduce((map, item) => { map[item.id.split(this.loggedInUserId + "_")[1]] = item.orderedQuantity + "$" + item.price; return map; }, {}),
          "shippingMethod": shippingMethod,
          "deliveryAddress": userData.get("deliveryAddress").length === 0 ? "ПАК: " + userData.get("deliveryAddressPAK") : userData.get("deliveryAddress"),
          "placedOn": this.firebaseApplication.firestore.FieldValue.serverTimestamp(),
          "status": "Текућа"
        }).then(order => {
          var newOrderId = order.id;
          orderedItems.forEach(orderedItem => {
            this.firestore.collection("reviews").add({
              "reviewedBy": this.loggedInUserId,
              "orderId": newOrderId,
              "productId": orderedItem.id.split(this.loggedInUserId + "_")[1],
              "comment": "",
              "lastChange": this.firebaseApplication.firestore.FieldValue.serverTimestamp(),
              "isAnonymous": false,
              "rating": 0
            });
          });
        }).then(() => resolve("Order placed successfully"))
          .catch(() => reject("Error occurred when placing order")/* error => reject(Error(error)) */);
      });
    });
  }

  updateUserEmail(newEmail: string) {
    this.auth.user.subscribe(result => {
      /* if (result) result.updateEmail(newEmail); */ /* Commented for testing purposes, i.e. creation of dummy accounts */
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
      result.updatePassword(this.cs.encrypt(this.key, newPassword)).then(() => {
        Swal.fire({
          title: "Лозинка успешно промењена!",
          text: "Успешно сте променили лозинку! Ради сигурности сада ћете бити излоговани.",
          icon: "success",
          showCancelButton: false,
          confirmButtonText: "У реду",
        }).then(() => this.signOut());
      }).catch(/* reject => console.error(reject) */);
    });
  }

  getFirestoreUserData(userId: string): Observable<any> {    
    return this.firestore.collection("users").doc(userId).get();
  }

  getFirstoreItemData(itemId: string): Observable<any> {
    return this.firestore.collection("items").doc(itemId).get();
  }

  getIDBData(): Observable<any> {
    const output: Observable<number[]> = new Observable((observer) => {
      this.idb.getObjectStoreItem(this.idb.getIDB(this.firebaseLocalStorageDb),
      "firebaseLocalStorage", IDBKeyRange.lowerBound(0))
        .then(value => observer.next(value[0]))
        .catch(error => observer.next(error));

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
      this.getIDBData().subscribe(result => this.userId = result !== undefined ? result["value"]["uid"] : null);
    }, 2000);
  }

  getItemsByCategory(categoryName: string): Array<Item> {
    var categoryItems: Array<Item> = [];

    this.firestore.collection("items").ref
      .where("categoryName", "==", categoryName).get().then(items => {
        items.forEach(item => {
          categoryItems.push({
            "id": item.id,
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

  getOrderData(userId: string): Promise<Array<Order>> {
    var orderData: Array<Order> = [];

    return new Promise((resolve, reject) => {
      this.firestore.collection("orders").ref.where("orderedBy", "==", userId).get().then(orders => {
        orders.docs.forEach(order => {
          orderData.push({
            "id": order.id,
            "placedOn": order.data()["placedOn"].toDate(), //Timestamp to Date
            "items": order.data()["items"],
            "deliveryAddress": order.data()["deliveryAddress"],
            "shippingMethod": order.data()["shippingMethod"],
            "status": order.data()["status"]
          });
        });
      }).then(() => resolve(orderData)).catch(/* error => reject(Error(error)) */);
    });
  }

  updateOrderData(newOrderData: Order): void {
    this.firestore.firestore.runTransaction(transaction =>
      transaction.get(this.firestore.collection("orders").doc(newOrderData.id).ref).then(document => {
        transaction.update(document.ref, {
          "placedOn": newOrderData.placedOn,
          "items": newOrderData.items,
          "deliveryAddress": newOrderData.deliveryAddress,
          "shippingMethod": newOrderData.shippingMethod,
          "status": newOrderData.status
        });
      }).then( /* resolve => console.log(resolve) */ )
        .catch( /* reject => console.error(reject) */)
    ).then(() => {
        Swal.fire({
          title: "Подаци поруџбине успешно промењени!",
          icon: "success",
          showCancelButton: false,
          confirmButtonText: "У реду",
        });
      })
      .catch(error => {
        /* console.error(error); */
        Swal.fire({
          title: "Грешка приликом промене података поруџбине!",
          text: "Проверите да ли сте повезани на интернет и покушајте поново! Уколико се грешка идаље појављује контактирајте администратора!",
          icon: "error",
          showCancelButton: false,
          confirmButtonText: "У реду",
        });
      });
  }

  getReviewData(orderId: string, itemId: string): Promise<Review> {
    return new Promise((resolve, reject) => {
      this.firestore.collection("reviews").ref.where("orderId", "==", orderId).where("productId", "==", itemId).onSnapshot(documents => {
        if (documents.empty)
          reject(null);
        else
          resolve(documents.docs[0].data() as Review);
      });
    });
  }

  getAllReviewsForProduct(itemId: string): Promise<Array<Review>> {
    return new Promise((resolve, reject) => {
      this.firestore.collection("reviews").ref.where("productId", "==", itemId).onSnapshot(documents => {
        if (documents.empty) resolve([])
        else resolve(documents.docs.reduce((output, document) => { output.push(document.data() as Review); return output; }, Array<Review>()))
      }, error => reject(error));
    });
  }

  updateReview(orderId: string, itemId: string, newReviewData: Review): Promise<boolean> {
    return new Promise((resolve, reject) => {
      return this.firestore.collection("reviews").ref.where("orderId", "==", orderId).where("productId", "==", itemId).onSnapshot(documents => {
        return this.firestore.firestore.runTransaction(transaction => /* Issue: This transaction keeps looping until page reload -> temporary solution reload page */
          transaction.get(documents.docs[0].ref).then(document => {
            transaction.update(document.ref, {
              "reviewedBy": newReviewData.reviewedBy,
              "orderId": newReviewData.orderId,
              "productId": newReviewData.productId,
              "rating": newReviewData.rating,
              "comment": newReviewData.comment,
              "isAnonymous": newReviewData.isAnonymous,
              "lastChange": this.firebaseApplication.firestore.FieldValue.serverTimestamp()
            });
          }).then( /* resolve => console.log(resolve) */)
            .catch( /* reject => console.error(error) */)
        ).then(() => resolve(true))
         .catch(reject => {
          /* reject(reject); */
          reject(false);
         });
      });
    });
  }
}