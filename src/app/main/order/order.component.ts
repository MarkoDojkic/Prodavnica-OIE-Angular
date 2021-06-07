import { FirebaseService } from './../../services/firebase/firebase.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Item } from '../shop/shop.model';
import { Order } from './order.model';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { trigger, state, style, transition, animate } from '@angular/animations';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
  
export class OrderComponent implements OnInit {

  listedOrders = new MatTableDataSource<Order>();
  displayedColumns: Array<string> = ["orderTime", "shippingAddress", "shippingMethod", "status", "totalPrice", "rating", "actions"];
  pageSizeOptionsSet: Set<number> = new Set<number>();
  pageSizeOptions: Array<number>;
  orderDetail: Array<Array<Item>>;
  expandedElement: Item | null;

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(private fs: FirebaseService) { }

  ngOnInit(): void {
    setTimeout(() => {
      this.refreshOrders();
    }, 2000);
  }

  refreshOrders(): void {
    var i = 0;

    this.fs.getOrderData(this.fs.loggedInUserId).then(data => {
      this.listedOrders.data = data;
      this.listedOrders.sort = this.sort;
      this.listedOrders.paginator = this.paginator;
      this.orderDetail = [];

      data.forEach(order => {      
        var orderedItemsData: Array<Item> = [];
        var i = 0;
        
        for (let id of Object.keys(order.items)) {
          this.fs.getFirstoreItemData(id).subscribe(item => {
            orderedItemsData.push({
              "id": item.id,
              "leftInStock": null,
              "title": item.data()["name"],
              "description": item.data()["description"],
              "price": item.data()["price"],
              "imageUrl": null,
              "orderedQuantity": Object.values(order.items)[i],
              "isEditing": false
            });
            
            i++;
          });
        }

        this.orderDetail.push(orderedItemsData);
      });
      
      this.pageSizeOptionsSet.clear();
      if (this.listedOrders.data.length !== 0) {
        this.pageSizeOptionsSet.add(1);
        this.pageSizeOptionsSet.add(Math.floor(this.listedOrders.data.length / 2));
        this.pageSizeOptionsSet.add(Math.floor(this.listedOrders.data.length / 5));
        this.pageSizeOptionsSet.add(Math.floor(this.listedOrders.data.length / 8));
        this.pageSizeOptionsSet.add(Math.floor(this.listedOrders.data.length / 10));
        this.pageSizeOptionsSet.add(this.listedOrders.data.length);
        this.pageSizeOptions = Array.from(this.pageSizeOptionsSet);
      }
    });
  }

  showItemDescription(productName: string, description: string): void {
    Swal.fire({
      title: "Опис за производ „" + productName + "“:",
      text: description,
      icon: "info",
      confirmButtonText: "У реду",
    });
  }

  cancelOrder(order: Order): void {
    Swal.fire({
      title: "Отказивање поруџбине",
      text: "Да ли сте сигурни да желите да откажете изабрану поруџбину? Након отказивања мораћете послатни ову уколико се предомислите!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Да",
      confirmButtonColor: "red",
      cancelButtonText: "Не",
      cancelButtonColor: "green",
    }).then(result => {
      if (result.isConfirmed) {
        order.status = "Отказана";
        this.fs.updateOrderData(order);
      }
    });
  }

  updateOrder(order: Order): void {
    this.fs.updateOrderData(order);
  }
  
  updateOrderItem(order: Order, index: number, itemId: string, isRemoval: boolean): void {
    if (isRemoval) {
      Swal.fire({
        title: "Уклањање производа из поруџбине",
        text: "Да ли сте сигурни да желите да уклоните изабраи производ? Овај процес није реверзибилан!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Да",
        confirmButtonColor: "red",
        cancelButtonText: "Не",
        cancelButtonColor: "green",
      }).then(result => {
        if (result.isConfirmed) {
          delete order.items[itemId];
          delete order.isEditing;
          this.fs.updateOrderData(order);
          setTimeout(() => {
            this.refreshOrders();
          }, 1000);
        }
      })
      
    }
    else {
      order.items[itemId] = this.orderDetail[index].find(item => item.id === itemId).orderedQuantity;
      delete order.isEditing;
      this.fs.updateOrderData(order);
      setTimeout(() => {
        this.refreshOrders();
      }, 1000);
    }
  }
  /*
  "comments": [
          [0, "ocena proizvoda ide od 0 - 10, a prikazati kao zvezdice, ovde ide komentar"],
          [0, "ocena proizvoda ide od 0 - 10, a prikazati kao zvezdice, ovde ide komentar"],
          [0, "ocena proizvoda ide od 0 - 10, a prikazati kao zvezdice, ovde ide komentar"]
        ]
        */
}
