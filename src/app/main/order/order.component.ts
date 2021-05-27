import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';

@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.css']
})
export class OrderComponent implements OnInit {

  constructor(private auth: AngularFireAuth) { }

  ngOnInit(): void {
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
