import { Item } from 'src/app/main/shop/shop.component';
import { IndexedDatabaseService } from '../../services/indexed-database/indexed-database.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Observable } from 'rxjs';
import Swal from 'sweetalert2';
import { MatSort } from '@angular/material/sort';
import { FirebaseService } from 'src/app/services/firebase/firebase.service';
import { MatPaginator } from '@angular/material/paginator';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {

  itemsInCart = new MatTableDataSource<Item>();
  displayedColumns: Array<string> = ["title","description","price","orderedQuantity","totalCost","actions"];
  shippingCost: number = 0;
  subtotal: number = 0;
  shippingVia: string;
  localStorageDb: string = "localStorageDb";
  pageSizeOptionsSet: Set<number> = new Set<number>();
  pageSizeOptions: Array<number>;

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(private idb: IndexedDatabaseService, private fs: FirebaseService) { }

  ngOnInit(): void {
    setTimeout(() => {
      new Observable((observer) => {
        this.idb.getAllObjectStoreItems(this.idb.getIDB(this.localStorageDb),
          "orderedProducts")
          .then(value => { observer.next(value); })
          .catch(error => { observer.next(error); });
  
        return {
          unsubscribe() {
            observer.remove(observer);
          }
        }
      }).subscribe(data => {
        this.itemsInCart.data = (data as Array<Item>).filter(item => item.id.includes(this.fs.loggedInUserId + "_"));
        this.itemsInCart.sort = this.sort;
        this.itemsInCart.paginator = this.paginator;
        this.updateSubtotal();
        
        this.pageSizeOptionsSet.clear();
        this.pageSizeOptionsSet.add(1);
        this.pageSizeOptionsSet.add(Math.floor(this.itemsInCart.data.length / 2));
        this.pageSizeOptionsSet.add(Math.floor(this.itemsInCart.data.length / 5));
        this.pageSizeOptionsSet.add(Math.floor(this.itemsInCart.data.length / 8));
        this.pageSizeOptionsSet.add(Math.floor(this.itemsInCart.data.length / 10));
        this.pageSizeOptionsSet.add(this.itemsInCart.data.length);
        this.pageSizeOptions = Array.from(this.pageSizeOptionsSet);
      });
    }, 2000); /* To give time for database to be opened by app component */
  }

  showDescription(productName: string, description: string): void {
    Swal.fire({
      title: "Опис за производ „" + productName + "“:",
      text: description,
      icon: "info",
      confirmButtonText: "У реду",
    });
  }

  updateItemQuntaty(item: Item): void {
    item.orderedQuantity = item.orderedQuantity > item.leftInStock ? item.leftInStock : item.orderedQuantity;
    this.idb.putObjectStoreItem(this.idb.getIDB(this.localStorageDb), "orderedProducts", item);
    this.updateSubtotal();
  }

  updateSubtotal(): void {
    this.subtotal = 0;
    this.itemsInCart.data.forEach(item => this.subtotal += item.price * item.orderedQuantity)
  }

  removeFromCart(droppedItem: Item): void {
    Swal.fire({
      title: "Уклањање производа из корпе",
      text: "Да ли сте сигурни да желите да избаците производ „" + droppedItem.title + "“ из корпе?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Да",
      confirmButtonColor: "red",
      cancelButtonText: "Не",
      cancelButtonColor: "green",
    }).then(result => {
      if (result.isConfirmed) {
        this.idb.removeObjectStoreItem(this.idb.getIDB(this.localStorageDb),
          "orderedProducts", this.fs.loggedInUserId + "_" + droppedItem.title);
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
        this.itemsInCart.data.forEach(item => {
          this.idb.removeObjectStoreItem(this.idb.getIDB(this.localStorageDb),
              "orderedProducts", this.fs.loggedInUserId + "_" + item.title);
        });
        
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

  submitOrder(): void {
    if (this.shippingVia.length > 0 && this.itemsInCart.data.length > 0
      && this.subtotal > 0 && this.shippingCost > -1) {
      
      Swal.fire({
        title: "Успешно послата поруџбина",
        text: "Сви производи из корпе су успешно поручени. Статус и податке о поруџбини можете пратити на страни Поруџбине. У сваком тренутку можете да откажете поруџбину, докле год она нема статус „Завршена“",
        icon: "success",
        showCancelButton: false,
        confirmButtonText: "У реду",
        allowOutsideClick: false
      }).then(() => {
        this.fs.updateFirestoreOrderData(this.itemsInCart.data, this.shippingVia,
        this.subtotal + this.subtotal / 5 + this.shippingCost);
      
        this.itemsInCart.data.forEach(item => {
          this.idb.removeObjectStoreItem(this.idb.getIDB(this.localStorageDb),
              "orderedProducts", this.fs.loggedInUserId + "_" + item.title);
        });
        this.itemsInCart.data = [];
        this.updateShipping(null);
        this.updateSubtotal();       
      });
    }
  }
}