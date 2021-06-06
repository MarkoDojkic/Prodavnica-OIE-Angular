import { FirebaseService } from './../../services/firebase/firebase.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { MatTableDataSource } from '@angular/material/table';
import { Item } from '../shop/shop.model';
import { Order } from './order.model';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { trigger, state, style, transition, animate } from '@angular/animations';

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
  displayedColumns: Array<string> = ["orderTime", "shippingAddress", "shippingMethod", "status", "totalPrice", "actions"];
  pageSizeOptionsSet: Set<number> = new Set<number>();
  pageSizeOptions: Array<number>;
  orderDetail: Array<Item>;
  expandedElement: Item | null;

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(private fs: FirebaseService) { }

  ngOnInit(): void {
    setTimeout(() => {
      this.refreshOrders();
    }, 5000);
  }

  refreshOrders(): void {
    this.fs.getOrderData(this.fs.loggedInUserId).then(data => {
      this.listedOrders.data = data;
      this.listedOrders.sort = this.sort;
      this.listedOrders.paginator = this.paginator;
      
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
  //"status": 'završena', 'tekuća', 'otkazana'
  //"shippingAddressOrPAK": Stored in users collection, retrive from there
  /*
  "comments": [
          [0, "ocena proizvoda ide od 0 - 10, a prikazati kao zvezdice, ovde ide komentar"],
          [0, "ocena proizvoda ide od 0 - 10, a prikazati kao zvezdice, ovde ide komentar"],
          [0, "ocena proizvoda ide od 0 - 10, a prikazati kao zvezdice, ovde ide komentar"]
        ]
        */
}
