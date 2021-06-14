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
  displayedColumns: Array<string> = ["orderTime", "deliveryAddress", "shippingMethod", "status", "subtotal", "rating", "actions"];
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
    }, 2000); /* Time needed to load firebase credentials */
  }

  filterOrders(filterValue: string): void {
    if (filterValue === undefined || filterValue.length === 0)
      this.orders.data = this.listedOrders;
    else
      this.orders.data = this.listedOrders.filter(order => JSON.stringify(Object.values(order)).includes(filterValue, 0));
    this.updatePageSizeOptions();
    //Example of search string: ["TE561FLEyixbxHtTjvmi","2020-11-04T03:06:35.000Z",{"item_117":"5$237500","item_52":"4$16700","item_35":"5$19200","item_21":"13$19200","item_36":"13$22300","item_71":"15$21000"},"Булевар Милутина Миланковића 25, Нови Београд","Пошта","Текућа",2657760]
  }

  findIndex(order: Order): number {
    return this.listedOrders.findIndex(o => o.id === order.id);
  }

  calculateSubtotal(order: Order): number {
    var output: number = 0;

    Object.values(order.items).forEach(item => {
      output += parseInt(item.split('$')[0]) * parseInt(item.split('$')[1]);
    })

    output += output / 5;

    switch (order.shippingMethod) {
      case "Лично преузимање": output += 0; break;
      case "Курирска служба": output += Object.keys(order.items).length * 1500; break;
      case "Пошта": output += Object.keys(order.items).length * 2000; break;
      default: output += 0;
    }

    return output;
  }

  updatePageSizeOptions(): void {
    this.pageSizeOptionsSet.clear();
    if (this.orders.data.length !== 0) {
      this.pageSizeOptionsSet.add(1);
      this.pageSizeOptionsSet.add(Math.floor(this.orders.data.length / 2));
      this.pageSizeOptionsSet.add(Math.floor(this.orders.data.length / 5));
      this.pageSizeOptionsSet.add(Math.floor(this.orders.data.length / 8));
      this.pageSizeOptionsSet.add(Math.floor(this.orders.data.length / 10));
      this.pageSizeOptionsSet.delete(0);
      this.pageSizeOptions = Array.from(this.pageSizeOptionsSet);
    }
  }

  refreshOrders(): void {
    this.fs.getOrderData(this.fs.loggedInUserId).then(data => {
      this.orderDetail = [];

      data.forEach(order => {
        var orderedItemsData: Array<Item> = [];
        var sumOfRatings: number = 0;
        var itemIndex: number = 0;
        
        for (let id of Object.keys(order.items)) {
          this.fs.getFirstoreItemData(id).subscribe(item => {
            if (order.status === "Завршена") {
              this.fs.getReviewData(order.id, id).then(response => {
                orderedItemsData.push({
                  "id": item.id,
                  "leftInStock": null,
                  "title": item.data()["name"],
                  "description": item.data()["description"],
                  "price": parseInt(Object.values(order.items)[itemIndex].split('$')[1]), /* Price at the time of initial purchase  */
                  "imageUrl": null,
                  "orderedQuantity": parseInt(Object.values(order.items)[itemIndex].split('$')[0]),
                  "isEditing": false,
                  "review": response
                });
                sumOfRatings += response.rating;
                itemIndex++;
              })
                .catch(error => {
                  console.error(error);
                  return null;
                });
            }
            else {
              orderedItemsData.push({
                "id": item.id,
                "leftInStock": item.data()["leftInStock"],
                "title": item.data()["name"],
                "description": item.data()["description"],
                "price": parseInt(Object.values(order.items)[itemIndex].split('$')[1]), /* Price at the time of initial purchase  */
                "imageUrl": null,
                "orderedQuantity": parseInt(Object.values(order.items)[itemIndex].split('$')[0]),
                "isEditing": false
              });
              itemIndex++;
            }
          });
        }
        
        setTimeout(() => { /* Waiting for loop to finish processing */
          order.subtotal = this.calculateSubtotal(order);
          if (order.status === "Завршена"){
            order.rating = Math.round(sumOfRatings / orderedItemsData.length);
          }

          this.orderDetail.push(orderedItemsData);  
        }, 2000);
      }, this);
      
      setTimeout(() => { /* works without this, but to avoid errors */
        this.orders.data = data;
        this.listedOrders = data;
        this.orders.sort = this.sort;
        this.orders.paginator = this.paginator;

        this.updatePageSizeOptions();
      }, 2001);
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
          this.orderDetail[index] = this.orderDetail[index].filter(item => item.id !== itemId);
          order.subtotal = this.calculateSubtotal(order);
          this.fs.updateOrderData(order);
        }
      })
      
    }
    else {
      order.items[itemId] = this.orderDetail[index].find(item => item.id === itemId).orderedQuantity + "$" + order.items[itemId].split('$')[1];
      order.subtotal = this.calculateSubtotal(order);
      this.fs.updateOrderData(order);
    }
  }
  
  updateReview(item: Item, order: Order): void {
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
        <span hidden="true" id="sweetAlertRating">`+item.review.rating+`</span>
        
        <span>Коментар (максимална дужина 510 карактера):</span><br>
        <textarea maxlength="510" id="sweetAlertReview" rows="10" cols="50" style="resize:none; font-size:inherit">`+ item.review.comment +`</textarea><br>
        <span><input type="checkbox" id="sweetAlertIsAnonymous"`+ (item.review.isAnonymous ? "checked" : "") + `> Сакри моје име и презиме</span><br>
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
        
        if (newRating === item.review.rating && newComment === item.review.comment
          && newIsAnonymous === item.review.isAnonymous) return; /* No new data */
                
        this.fs.updateReview(item.review.orderId, item.review.productId, {
          "reviewedBy": item.review.reviewedBy,
          "orderId": item.review.orderId,
          "productId": item.review.productId,
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
          }).finally(() => {
            order.rating = Math.round((Object.keys(order.items).length * order.rating - item.review.rating + newRating) / Object.keys(order.items).length);
            item.review = {
              "reviewedBy": item.review.reviewedBy,
              "orderId": item.review.orderId,
              "productId": item.review.productId,
              "rating": newRating,
              "comment": newComment,
              "isAnonymous": newIsAnonymous
            };
          });
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

