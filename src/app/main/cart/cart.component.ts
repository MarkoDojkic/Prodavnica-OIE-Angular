import { IndexedDatabaseService } from './../indexed-database/indexed-database.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Observable } from 'rxjs';
import Swal from 'sweetalert2';
import { MatSort } from '@angular/material/sort';

interface ItemInCart {
  productTitle: string,
  description: string,
  orderedQuantity: number,
  inStock: number,
  price: number,
  isEditing?: boolean //For editing quantity, is optional because it isn't stored in indexedDB
}

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {

  itemsInCart = new MatTableDataSource<ItemInCart>();
  displayedColumns: Array<string> = ["productTitle","description","price","orderedQuantity","totalCost","actions"];
  shippingCost: number = undefined;
  subtotal: number;
  shippingMethod: Array<boolean> = [false, false, false];
  shippingVia: string;
  localStorageDb: string = "localStorageDb";

  @ViewChild(MatSort) sort: MatSort;

  constructor(private idb: IndexedDatabaseService) { }

  ngOnInit(): void {
    setTimeout(() => {
      new Observable((observer) => {
        this.idb.getObjectStoreItem(this.idb.getIDB(this.localStorageDb),
          "orderedProducts", IDBKeyRange.lowerBound(0))
          .then(value => { observer.next(value); })
          .catch(error => { observer.next(error); });
  
        return {
          unsubscribe() {
            observer.remove(observer);
          }
        }
      }).subscribe(data => {
        this.itemsInCart.data = (data as Array<ItemInCart>);
        this.itemsInCart.sort = this.sort;
        this.updateSubtotal();
      });
    }, 1000); /* To give time for database to be opened by app component */
  }

  showDescription(productName: string, description: string): void {
    Swal.fire({
      title: "Опис за производ „" + productName + "“:",
      text: description,
      icon: "info",
      confirmButtonText: "У реду",
    });
  }

  updateItemQuntaty(item: ItemInCart): void {
    item.orderedQuantity = item.orderedQuantity > item.inStock ? item.inStock : item.orderedQuantity;
    this.idb.putObjectStoreItem(this.idb.getIDB(this.localStorageDb), "orderedProducts", item);
    this.updateSubtotal();
  }

  updateSubtotal(): void {
    this.subtotal = 0;
    this.itemsInCart.data.forEach(item => this.subtotal += item.price * item.orderedQuantity)
  }

  removeFromCart(droppedItem: ItemInCart): void {
    Swal.fire({
      title: "Уклањање производа из корпе",
      text: "Да ли сте сигурни да желите да избаците производ „" + droppedItem.productTitle + "“ из корпе?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Да",
      confirmButtonColor: "red",
      cancelButtonText: "Не",
      cancelButtonColor: "green",
    }).then(result => {
      if (result.isConfirmed) {
        this.idb.removeObjectStoreItem(this.idb.getIDB(this.localStorageDb), "orderedProducts", droppedItem.productTitle);
        this.itemsInCart.data = this.itemsInCart.data.filter(item => item !== droppedItem);
        this.updateSubtotal();
      }
    })
  }

  emptyCart(): void {
    Swal.fire({
      title: "Пражњење корпе",
      text: "Да ли сте сигурни да желите да испразните корпу?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Да",
      confirmButtonColor: "red",
      cancelButtonText: "Не",
      cancelButtonColor: "green",
    }).then(result => {
      if (result.isConfirmed) {
        this.idb.clearObjectStoredatabase(this.idb.getIDB(this.localStorageDb), "orderedProducts");
        this.itemsInCart.data = [];
        this.updateSubtotal();
      }
    })
  }

  updateShipping(shippingVia: string): void {   
    switch (shippingVia) {
      case "Лично преузимање": this.shippingCost = 0; break;
      case "Курирска служба": this.shippingCost = this.itemsInCart.data.length * 1500; break;
      case "Пошта": this.shippingCost = this.itemsInCart.data.length * 2000; break;
      default: this.shippingCost = undefined;
    }
    this.shippingVia = shippingVia;
  }
}