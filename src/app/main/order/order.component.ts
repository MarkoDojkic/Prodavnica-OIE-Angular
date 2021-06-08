import { Review } from './../../model/review.model';
import { FirebaseService } from './../../services/firebase/firebase.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Item } from 'src/app/model/item.model';
import { Order } from '../../model/order.model';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { trigger, state, style, transition, animate } from '@angular/animations';
import Swal from 'sweetalert2';
import { NotifierService } from 'angular-notifier';

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

  constructor(private fs: FirebaseService, private ns: NotifierService) { }

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
      text: "Да ли сте сигурни да желите да откажете изабрану поруџбину? Након отказивања мораћете послати нову уколико се предомислите!",
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
        text: "Да ли сте сигурни да желите да уклоните изабрани производ? Овај процес није реверзибилан!",
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

/*   onHoverRating(elementId: string, selectedRating: number): void { 
    for (let i = 1; i <= 5; i++) {
      document.querySelector("#" + elementId + "_rating_" + i).innerHTML = i <= selectedRating ? "star_rate" : "star_outline";
    }
    
    document.querySelector("#sweetAlertRating").innerHTML = selectedRating.toString();
  } */

  getReviewData(orderId: string, itemId: string): any {
    this.fs.getReviewData(orderId, itemId)
      .then(response => { return response; })
      .catch(error => {
        /* console.log(error); */
        return null;
      });
  }

  getReviewRating(orderId: string, itemId: string): number {
    var review = this.getReviewData(orderId, itemId);
    if (review !== null) return (review as Review).rating;
    else return -1;
  }

  getReviewComment(orderId: string, itemId: string): string {
    var review = this.getReviewData(orderId, itemId);
    if (review !== null) return (review as Review).review;
    else return "";
  }
  
  updateReview(orderId: string, productId: string): void {
    Swal.fire({
      title: "Приказ и измена рецензије изабраног производа",
      html: `
        <span>Оцена (за негативну оцену пређите мишем лево од прве звездице):</span><br>
        <div fxLayout="row" fxLayoutAlign="space-evenly stretch" fxLayoutGap="2%">
          <button _ngcontent-hdn-c273="" mat-icon-button="" class="mat-focus-indicator ng-tns-c273-0 mat-icon-button mat-button-base" onmouseover="onHoverRating(0)" style="color: transparent; width: 0.5px;"></button>
          <button _ngcontent-hdn-c273="" mat-icon-button="" class="mat-focus-indicator ng-tns-c273-0 mat-icon-button mat-button-base" onmouseover="onHoverRating(1)">
              <mat-icon _ngcontent-ynd-c273="" role="img" class="mat-icon notranslate material-icons mat-icon-no-color" aria-hidden="true" data-mat-icon-type="font" id="sweetAlertRating_rating_1">star_outline</mat-icon>
          </button>
          <button _ngcontent-hdn-c273="" mat-icon-button="" class="mat-focus-indicator ng-tns-c273-0 mat-icon-button mat-button-base" onmouseover="onHoverRating(2)">
              <mat-icon _ngcontent-ynd-c273="" role="img" class="mat-icon notranslate material-icons mat-icon-no-color" aria-hidden="true" data-mat-icon-type="font" id="sweetAlertRating_rating_2">star_outline</mat-icon>
          </button>
          <button _ngcontent-hdn-c273="" mat-icon-button="" class="mat-focus-indicator ng-tns-c273-0 mat-icon-button mat-button-base" onmouseover="onHoverRating(3)">
              <mat-icon _ngcontent-ynd-c273="" role="img" class="mat-icon notranslate material-icons mat-icon-no-color" aria-hidden="true" data-mat-icon-type="font" id="sweetAlertRating_rating_3">star_outline</mat-icon>
          </button>
          <button _ngcontent-hdn-c273="" mat-icon-button="" class="mat-focus-indicator ng-tns-c273-0 mat-icon-button mat-button-base" onmouseover="onHoverRating(4)">
              <mat-icon _ngcontent-ynd-c273="" role="img" class="mat-icon notranslate material-icons mat-icon-no-color" aria-hidden="true" data-mat-icon-type="font" id="sweetAlertRating_rating_4">star_outline</mat-icon>
          </button>
          <button _ngcontent-hdn-c273="" mat-icon-button="" class="mat-focus-indicator ng-tns-c273-0 mat-icon-button mat-button-base" onmouseover="onHoverRating(5)">
              <mat-icon _ngcontent-ynd-c273="" role="img" class="mat-icon notranslate material-icons mat-icon-no-color" aria-hidden="true" data-mat-icon-type="font" id="sweetAlertRating_rating_5">star_outline</mat-icon>
          </button>
        </div>
        <span hidden="true" id="sweetAlertRating"></span>
        
        <span>Коментар (максимална дужина 510 карактера):</span><br><br>
        <textarea maxlength="510" id="sweetAlertReview" rows="10" cols="50" style="resize:none"></textarea>
      `,
      showCancelButton: true,
      confirmButtonText: "Измени рецензију",
      confirmButtonColor: "green",
      cancelButtonText: "Одустани",
      cancelButtonColor: "red",
      allowOutsideClick: false
    }).then(response => {
      if (response.isConfirmed) {
        var newRating: number = parseInt(Swal.getPopup().querySelector("#sweetAlertRating").innerHTML);
        var newReview: string = (Swal.getPopup().querySelector("#sweetAlertReview") as HTMLTextAreaElement).value;

        this.fs.updateReview(orderId, productId, {
          "authorId": this.fs.loggedInUserId,
          "orderId": orderId,
          "productId": productId,
          "rating": newRating,
          "review": newReview
        }).then(() => {
          Swal.fire({
            title: "Подаци рецензије успешно промењени",
            icon: "success",
            showCancelButton: false,
            confirmButtonText: "У реду",
            allowOutsideClick: false
          });
        }, reject => {
          //console.error(reject);
          Swal.fire({
            title: "Грешка приликом промене података",
            text: "Није могуће променити податке рецензије. Проверите да ли сте повезани на интернет. Уколико се грешка идаље појављује контактирајте администратора.",
            icon: "error",
            showCancelButton: false,
            confirmButtonText: "У реду",
            allowOutsideClick: false
          });
        });
      }
    });
  }
}
