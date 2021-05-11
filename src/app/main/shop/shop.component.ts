import { Component, OnInit } from '@angular/core';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { FirebaseService } from 'src/app/auth/firebase/firebase.service';
import { ChangeContext, LabelType, Options } from '@angular-slider/ngx-slider';
import { Item, CategoryNode, FlatNode } from './shop.model';

@Component({
  selector: 'app-shop',
  templateUrl: './shop.component.html',
  styleUrls: ['./shop.component.css']
})
  
export class ShopComponent implements OnInit {

  num_of_cols: number;
  selectedCategory: string;
  items: Array<Item>;
  filteredItems: Array<Item>;
  rowHeight: string;
  filterShow = false;
  minPrice: number;
  maxPrice: number;
  priceSliderOptions: Options;

  _transformer = (node: CategoryNode, level: number) => {
    return {
      expandable: !!node.children && node.children.length > 0,
      name: node.name,
      level: level,
    };
  }

  treeControl = new FlatTreeControl<FlatNode>(
      node => node.level, node => node.expandable);

  treeFlattener = new MatTreeFlattener(
      this._transformer, node => node.level, node => node.expandable, node => node.children);

  categoriesSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

  hasChild = (_: number, node: FlatNode) => node.expandable;

  constructor(private fs:FirebaseService) {
    this.categoriesSource.data = [
      {
        name: 'Соларни панели',
        children: [
          {name: 'Монокристални'},
          {name: 'Поликристални'},
          {name: 'Аморфни'},
        ]
      },
      {
        name: 'Контролери пуњења акумулатора',
        children: [
          {name: 'PWM'},
          {name: 'MPPT'}
        ]
      },
      {
        name: 'Инвертори',
        children: [
          {name: 'OFF-Grid'},
          {name: 'ON-Grid' },
          {name: 'Хибридни'}
        ]
      },
      {
        name: 'Ветрогенератори',
        children: [
          {name: 'Хоризонтални'},
          {name: 'Вертикални' }
        ]
      },
      {
        name: 'Акумулатори',
        children: [
          { name: 'Оловни' },
          { name: 'Никл базирани' },
          { name: 'Литијумски' },
          { name: 'Специјални' }
        ]
      },
      {
       name: 'Електрична возила' 
      }
    ];
  }

  ngOnInit(): void {
    this.onResize(null);
  }

  onResize(event: any | null): void {
    if(window.innerWidth > 1920)
      this.num_of_cols = 5
    else if (window.innerWidth <= 1920 && window.innerWidth > 1300)
      this.num_of_cols = 4
    else if (window.innerWidth <= 1300 && window.innerWidth > 1000)
      this.num_of_cols = 3
    else if (window.innerWidth <= 1000 && window.innerWidth > 670)
      this.num_of_cols = 2
    else if (window.innerWidth <= 670)
      this.num_of_cols = 1
  }

  displayItems(category: string): void {
    this.items = this.fs.getItemsByCategory(category);
    this.selectedCategory = category;
    switch (this.selectedCategory) {
      case "Монокристални": this.rowHeight = "1:2.2"; break;
      case "Поликристални": this.rowHeight = "1:2.1"; break;
      case "Аморфни": this.rowHeight = "1:2.2"; break;
      case "PWM": this.rowHeight = "1:2.5"; break;
      case "MPPT": this.rowHeight = "1:2.2"; break;
      case "OFF-Grid": this.rowHeight = "1:2"; break;
      case "ON-Grid": this.rowHeight = "1:2.2"; break;
      case "Хибридни": this.rowHeight = "1:2.3"; break;
      case "Хоризонтални": this.rowHeight = "1:2.8"; break;
      case "Вертикални": this.rowHeight = "1:2.7"; break;
      case "Оловни": this.rowHeight = "1:1.9"; break;
      case "Никл базирани": this.rowHeight = "1:1.9"; break;
      case "Литијумски": this.rowHeight = "1:2"; break;
      case "Специјални": this.rowHeight = "1:2"; break;
      case "Електрична возила": this.rowHeight = "1:1.8"; break;
      default: this.rowHeight = "1:1";
    }

    setTimeout(() => {
      var min = Math.min.apply(Math, this.items.map(item => { return item.price; }));
      var max = Math.max.apply(Math, this.items.map(item => { return item.price; }));

      this.minPrice = min;
      this.maxPrice = max;

      this.priceSliderOptions = {
        floor: min,
        ceil: max,
        step: (max - min) / 10,
        translate: (value: number, label: LabelType): string => {
          switch (label) {
            case LabelType.Low:
              return "<b>" + value + " РСД</b>";
            case LabelType.High:
              return "<b>" + value + " РСД</b>";
            default:
              return value + " РСД";
          }
        }
      };
      this.filteredItems = this.items;
    }, 1000);
  }

  filterByPrice(filterValues: ChangeContext): void {
    this.filteredItems = this.items.filter(item => {
      return item.price >= filterValues.value && item.price <= filterValues.highValue;
    });
  }
}

export { Item, CategoryNode, FlatNode }; //To resolve additional export request by Angular