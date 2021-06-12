import { Review } from '../../model/review.model';
import { FirebaseService } from '../../services/firebase/firebase.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Item } from 'src/app/model/item.model';
import { Order } from '../../model/order.model';
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

  orders = new MatTableDataSource<Order>();
  listedOrders: Array<Order>;
  displayedColumns: Array<string> = ["orderTime", "deliveryAddress", "shippingMethod", "status", "totalPrice", "rating", "actions"];
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

  filterOrders(filterValue: string): void {
    if (filterValue === undefined || filterValue.length === 0)
      this.orders.data = this.listedOrders;
    else
      this.orders.data = this.listedOrders.filter(order => JSON.stringify(Object.values(order)).includes(filterValue, 0));
    //Example of search string: ["d2sgFAJ6JdW0ya6dHbGn","2021-06-09T14:44:34.578Z",{"item_39":1,"item_44":3,"item_88":1,"item_125":24,"item_2":5,"item_73":1},"Булевар Милутина Миланковића 25","Курирска служба","Завршена",8438004,4]
  }

  refreshOrders(): void {
    var i = 0;

    this.fs.getOrderData(this.fs.loggedInUserId).then(data => {
      this.orderDetail = [];

      data.forEach(order => {
        var orderedItemsData: Array<Item> = [];
        var sumOfRatings: number = 0;
        var i = 0;
        
        for (let id of Object.keys(order.items)) {
          this.fs.getFirstoreItemData(id).subscribe(item => {
            this.fs.getReviewData(order.id, id)
              .then(response => {
                orderedItemsData.push({
                  "id": item.id,
                  "leftInStock": null,
                  "title": item.data()["name"],
                  "description": item.data()["description"],
                  "price": item.data()["price"],
                  "imageUrl": null,
                  "orderedQuantity": Object.values(order.items)[i],
                  "isEditing": false,
                  "review": response
                });
                sumOfRatings += response.rating;
                i++;
              })
              .catch(error => {
                /* console.error(error); */
                return null;
              });
          });
        }
        
        setTimeout(() => { /* Waiting for loop to finish processing */
          order.rating = Math.round(sumOfRatings / orderedItemsData.length);
          this.orderDetail.push(orderedItemsData);
        }, 1000);
      });
      
      setTimeout(() => { /* works without this, but to avoid errors */
        this.orders.data = this.listedOrders = data;
        this.orders.sort = this.sort;
        this.orders.paginator = this.paginator;

        this.pageSizeOptionsSet.clear();
        if (this.orders.data.length !== 0) {
          this.pageSizeOptionsSet.add(1);
          this.pageSizeOptionsSet.add(Math.floor(this.orders.data.length / 2));
          this.pageSizeOptionsSet.add(Math.floor(this.orders.data.length / 5));
          this.pageSizeOptionsSet.add(Math.floor(this.orders.data.length / 8));
          this.pageSizeOptionsSet.add(Math.floor(this.orders.data.length / 10));
          this.pageSizeOptionsSet.add(this.orders.data.length);
          this.pageSizeOptions = Array.from(this.pageSizeOptionsSet);
        }
      }, 1000);
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
        delete order.id; //Delete unnecessary variable
        delete order.isEditing; //Delete unnecessary variable
        delete order.rating; //Delete unnecessary variable
        this.fs.updateOrderData(order);
      }
    });
  }

  updateOrder(order: Order): void {
    delete order.id; //Delete unnecessary variable
    delete order.isEditing; //Delete unnecessary variable
    delete order.rating; //Delete unnecessary variable
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
          delete order.id; //Delete unnecessary variable
          delete order.isEditing; //Delete unnecessary variable
          delete order.rating; //Delete unnecessary variable
          this.fs.updateOrderData(order);
          setTimeout(() => {
            this.refreshOrders();
          }, 1000);
        }
      })
      
    }
    else {
      order.items[itemId] = this.orderDetail[index].find(item => item.id === itemId).orderedQuantity;
      delete order.id; //Delete unnecessary variable
      delete order.isEditing; //Delete unnecessary variable
      delete order.rating; //Delete unnecessary variable
      this.fs.updateOrderData(order);
      setTimeout(() => {
        this.refreshOrders();
      }, 1000);
    }
  }
  
  updateReview(previousReviewData: Review): void {
    Swal.fire({
      title: "Приказ и измена рецензије изабраног производа",
      customClass: { popup: "sweetAlertDisplayFix" },
      html: `
      <div _ngcontent-bjf-c268="" fxlayout="column" fxlayoutalign="center stretch" fxlayoutgap="2%" ng-reflect-fx-layout="column" ng-reflect-fx-layout-align="center stretch" ng-reflect-fx-layout-gap="2%" style="flex-direction: column; box-sizing: border-box; display: flex; place-content: stretch center; align-items: stretch; max-width: 100%;" class="mat-card">      
        <span>Оцена (за негативну оцену пређите мишем лево од прве звездице):</span>
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
        <span hidden="true" id="sweetAlertRating">`+previousReviewData.rating+`</span>
        
        <span>Коментар (максимална дужина 510 карактера):</span><br>
        <textarea maxlength="510" id="sweetAlertReview" rows="10" cols="50" style="resize:none; font-size:inherit">`+ previousReviewData.comment +`</textarea><br>
        <span><input type="checkbox" id="sweetAlertIsAnonymous"`+ (previousReviewData.isAnonymous ? "checked" : "") + `> Сакри моје име и презиме</span><br>
      </div>
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
        var newComment: string = (Swal.getPopup().querySelector("#sweetAlertReview") as HTMLTextAreaElement).value.trim();
        var newIsAnonymous: boolean = (Swal.getPopup().querySelector("#sweetAlertIsAnonymous") as HTMLInputElement).checked;
        
        if (newRating === previousReviewData.rating && newComment === previousReviewData.comment
          && newIsAnonymous === previousReviewData.isAnonymous) return; /* No new data */

        this.fs.updateReview(previousReviewData.orderId, previousReviewData.productId, {
          "reviewedBy": previousReviewData.reviewedBy,
          "orderId": previousReviewData.orderId,
          "productId": previousReviewData.productId,
          "rating": newRating,
          "comment": newComment,
          "isAnonymous": newIsAnonymous
        }).then(() => {
          Swal.fire({
            title: "Подаци рецензије успешно промењени",
            icon: "success",
            showCancelButton: false,
            confirmButtonText: "У реду",
            allowOutsideClick: false
          }).then(() => window.location.reload()); /* Temporary fix for issue on firebase.service.ts line 304 */
        }, reject => {
          /* console.error(reject); */
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
