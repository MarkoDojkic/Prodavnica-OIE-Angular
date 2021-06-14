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
  shippingCost: number = undefined;
  subtotal: number = undefined;
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
        if (this.itemsInCart.data.length !== 0) {
          this.pageSizeOptionsSet.add(1);
          this.pageSizeOptionsSet.add(Math.floor(this.itemsInCart.data.length / 2));
          this.pageSizeOptionsSet.add(Math.floor(this.itemsInCart.data.length / 5));
          this.pageSizeOptionsSet.add(Math.floor(this.itemsInCart.data.length / 8));
          this.pageSizeOptionsSet.add(Math.floor(this.itemsInCart.data.length / 10));
          this.pageSizeOptionsSet.add(this.itemsInCart.data.length);
          this.pageSizeOptionsSet.delete(0);
          this.pageSizeOptions = Array.from(this.pageSizeOptionsSet);
        }
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
          "orderedProducts", droppedItem.id);
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
              "orderedProducts", item.id);
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
      
      this.fs.placeOrder(this.itemsInCart.data, this.shippingVia).then(() => {
          Swal.fire({
            title: "Успешно послата поруџбина",
            text: "Сви производи из корпе су успешно поручени. Статус и податке о поруџбини можете пратити на страни Поруџбине. У сваком тренутку можете да откажете поруџбину, докле год она нема статус „Завршена“",
            icon: "success",
            showCancelButton: false,
            confirmButtonText: "У реду",
            allowOutsideClick: false
          }).finally(() => {
            this.itemsInCart.data.forEach(item => {
              this.idb.removeObjectStoreItem(this.idb.getIDB(this.localStorageDb),
                "orderedProducts", item.id);
            });
            this.itemsInCart.data = [];
            this.updateShipping(undefined);
            this.updateSubtotal();
          });
        }).catch(reject => {
          /* console.error(reject); */
          Swal.fire({
            title: "Грешка приликом слања поруџбине",
            text: "Проверите да ли сте повезани на интернет или покушајте поново. Уколико се ова грешка идаље појављује контактирајте администратора",
            icon: "error",
            showCancelButton: false,
            confirmButtonText: "У реду",
            allowOutsideClick: false
          });
        });
    }
  }
}