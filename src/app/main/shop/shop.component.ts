import { Component, OnInit } from '@angular/core';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { FirebaseService } from 'src/app/auth/firebase/firebase.service';
import { LabelType, Options } from '@angular-slider/ngx-slider';
import { Item, CategoryNode, FlatNode } from './shop.model';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { KeyValue } from '@angular/common';

@Component({
  selector: 'app-shop',
  templateUrl: './shop.component.html',
  styleUrls: ['./shop.component.css']
})
  
export class ShopComponent implements OnInit {

  numberOfColums: number;
  rowHeight: string;
  selectedCategory: string;
  items: Array<Item>;
  filteredItems: Array<Item>;
  filterShow = false;
  priceSliderOptions: Options;
  priceSliderOptionsDrivingRange: Options;

  //Filtering values
  minPrice: number;
  maxPrice: number;
  minInStock: number;
  voltages: Map<string, boolean>;
  amperages: Map<string, boolean>;
  wattages: Map<string, boolean>;
  amperhours: Map<string, boolean>;
  minDrivingRange: number;
  maxDrivingRange: number;

  //To order when using keyvalue pipe in amperages * otherwise it'll sort like strings *
  orderByNumber = (a: KeyValue<number, string>, b: KeyValue<number, string>): number => {
    return parseInt(a.key.toString().slice(0, a.key.toString().length - 1))
              < parseInt(b.key.toString().slice(0, b.key.toString().length - 1)) ? -1 : 1;
  };
  
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

  onResize(_event: any | null): void {
    if(window.innerWidth > 1920)
      this.numberOfColums = 5
    else if (window.innerWidth <= 1920 && window.innerWidth > 1300)
      this.numberOfColums = 4
    else if (window.innerWidth <= 1300 && window.innerWidth > 1000)
      this.numberOfColums = 3
    else if (window.innerWidth <= 1000 && window.innerWidth > 670)
      this.numberOfColums = 2
    else if (window.innerWidth <= 670)
      this.numberOfColums = 1
  }

  displayItems(category: string): void {
    this.items = this.fs.getItemsByCategory(category);
    setTimeout(() => {
      this.selectedCategory = category;
      this.voltages = this.amperages = this.wattages = this.amperhours = null;

      switch (this.selectedCategory) {
        case "Монокристални":
          this.rowHeight = "1:2.2";
          this.voltages = new Map([["12V", true], ["24V/36V", true], ["48V", true]]);
          break;
        case "Поликристални":
          this.rowHeight = "1:2.1";
          this.voltages = new Map([["12V", true], ["24V", true], ["36V", true]]);
          break;
        case "Аморфни":
          this.rowHeight = "1:2.2";
          this.voltages = new Map([["12V", true], ["24V", true], ["36V", true], ["48V", true], ["84V", true]]);
          break;
        case "PWM":
          this.rowHeight = "1:2.6";
          this.voltages = new Map([["12V/24V", true], ["48V", true]]);
          this.amperages = new Map(this.items.map(item => {
            var temp = item.description;
            temp = temp.slice(temp.lastIndexOf("Максимална струја пуњења: "),
                                temp.lastIndexOf(" Подразумевани напон искључења"))
            temp = temp.slice(26, temp.length);
            return [temp, true];
          }));
          break;
        case "MPPT":
          this.rowHeight = "1:2.2";
          this.amperages = new Map(this.items.map(item => {
            var temp = item.description;
            temp = temp.slice(temp.lastIndexOf("Максимална струја пуњења: "),
                                temp.lastIndexOf(" Ефективност конверзије"))
            temp = temp.slice(26, temp.length);
            return [temp, true];
          }));
          break;
        case "OFF-Grid":
          this.rowHeight = "1:2.1";
          this.wattages = new Map(this.items.map(item => {
            var temp = item.description;
            temp = temp.slice(temp.lastIndexOf("Излазна снага: "),
                                temp.lastIndexOf(" Излазна снага у"))
            temp = temp.slice(15, temp.length);
            return [temp, true];
          }));
          break;
        case "ON-Grid":
          this.rowHeight = "1:2.3";
          this.wattages = new Map(this.items.map(item => {
            var temp = item.description;
            temp = temp.slice(temp.lastIndexOf("Максимала препоручена снага система:"),
                                temp.lastIndexOf(" Улазни напон:"))
            temp = temp.slice(36, temp.length);
            return [temp, true];
          }));
          break;
        case "Хибридни":
          this.rowHeight = "1:2.4";
          this.wattages = new Map(this.items.map(item => {
            var temp = item.description;
            temp = temp.slice(temp.lastIndexOf("Снага система: "),
                                temp.lastIndexOf(" Снага система у пику"))
            temp = temp.slice(15, temp.length);
            return [temp, true];
          }));
          break;
        case "Хоризонтални":
          this.rowHeight = "1:2.9";
          this.wattages = new Map(this.items.map(item => {
            var temp = item.description;
            temp = temp.slice(temp.lastIndexOf("Излазна снага: "),
                                temp.lastIndexOf(" Максимална излазна снага"))
            temp = temp.slice(15, temp.length);
            return [temp, true];
          }));
          break;
        case "Вертикални":
          this.rowHeight = "1:2.9";
          this.wattages = new Map(this.items.map(item => {
            var temp = item.description;
            temp = temp.slice(temp.lastIndexOf("Излазна снага: "),
              temp.lastIndexOf(" Максимална излазна снага"))
            temp = temp.slice(15, temp.length);
            return [temp, true];
          }));
          break;
        case "Оловни":
          this.rowHeight = "1:1.9";
          this.amperhours = new Map(this.items.map(item => {
            var temp = item.description;
            temp = temp.slice(temp.lastIndexOf("Максимални капацитет: "),
                                temp.lastIndexOf(" Радна температура"))
            temp = temp.slice(22, temp.length);
            return [temp, true];
          }));
          break;
        case "Никл базирани":
          this.rowHeight = "1:1.9";
          this.amperhours = new Map(this.items.map(item => {
            var temp = item.description;
            temp = temp.slice(temp.lastIndexOf("Максимални капацитет: "),
                                temp.lastIndexOf(" Радна температура"))
            temp = temp.slice(22, temp.length);
            return [temp, true];
          }));
          break;
        case "Литијумски":
          this.rowHeight = "1:2";
          this.amperhours = new Map(this.items.map(item => {
            var temp = item.description;
            temp = temp.slice(temp.lastIndexOf("Максимални капацитет: "),
                                temp.lastIndexOf(" Максимална дозвољена"))
            temp = temp.slice(22, temp.length);
            return [temp, true];
          }));
          break;
        case "Специјални":
          this.rowHeight = "1:2.1";
          this.amperhours = new Map(this.items.map(item => {
            var temp = item.description;
            temp = temp.slice(temp.lastIndexOf("Максимални капацитет: "),
                                temp.lastIndexOf(" Максимална дозвољена"))
            temp = temp.slice(22, temp.length);
            return [temp, true];
          }));
          break;
        case "Електрична возила":
          this.rowHeight = "1:1.8";
          var minDR = Math.min.apply(Math, this.items.map(item => {
            var temp = item.description;
            temp = temp.slice(temp.lastIndexOf("Домет при пуној батерији: "),
                                temp.lastIndexOf(" km Број путника:"))
            temp = temp.slice(26, temp.length);
            return parseInt(temp);
          }));
          var maxDR = Math.max.apply(Math, this.items.map(item => {
            var temp = item.description;
            temp = temp.slice(temp.lastIndexOf("Домет при пуној батерији: "),
                                temp.lastIndexOf(" km Број путника:"))
            temp = temp.slice(26, temp.length);
            return parseInt(temp);
           }));

          this.minDrivingRange = minDR;
          this.maxDrivingRange = maxDR;

          this.priceSliderOptionsDrivingRange = {
            floor: minDR,
            ceil: maxDR,
            step: (maxDR - minDR) / 10,
            translate: (value: number, label: LabelType): string => {
              switch (label) {
                case LabelType.Low:
                  return "<b>" + value + " километара</b>";
                case LabelType.High:
                  return "<b>" + value + " километара</b>";
                default:
                  return value + " километара";
              }
            },
            hideLimitLabels: true
          };
          break;
        default: this.rowHeight = "1:1";
      }

      this.filteredItems = this.items;
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
        },
        hideLimitLabels: true
      };
    }, 1000);
  }

  applyFilters(): void {
    this.filteredItems = this.items.filter(item => {
      return item.price >= this.minPrice && item.price <= this.maxPrice;
    })
      
    if (this.minInStock != null || this.minInStock != undefined)
      this.filteredItems = this.filteredItems.filter(item => item.leftInStock >= this.minInStock);
    
    if (this.selectedCategory === "Монокристални" || this.selectedCategory === "Поликристални" || this.selectedCategory === "Аморфни") {
      for (var key of Array.from(this.voltages.keys())) {
        if (key === "12V" && !this.voltages.get(key)) this.filterOutVoltage(12, 24);
        if (key === "24V" && !this.voltages.get(key)) this.filterOutVoltage(24, 36);
        if (key === "24V/36V" && !this.voltages.get(key)) this.filterOutVoltage(24, 48);
        if (key === "36V" && !this.voltages.get(key)) this.filterOutVoltage(36, 48);
        if (key === "48V" && !this.voltages.get(key)) this.filterOutVoltage(48, 84);
        if (key === "84V" && !this.voltages.get(key)) this.filterOutVoltage(84, 100);
      }
    }

    if (this.selectedCategory === "PWM") {
      for (var key of Array.from(this.voltages.keys())) {
        if (!this.voltages.get(key)) {
          this.filteredItems = this.filteredItems.filter(item => {
            var temp = item.description;
            temp = temp.slice(temp.lastIndexOf("Напон система: "),
              temp.lastIndexOf(" Максимални улазни напон:"))
            temp = temp.slice(15, temp.length);
            return temp !== key;
          });
        }
      }

      for (var key of Array.from(this.amperages.keys())) {
        if (!this.amperages.get(key)) {
          this.filteredItems = this.filteredItems.filter(item => {
            var temp = item.description;
            temp = temp.slice(temp.lastIndexOf("Максимална струја пуњења: "),
              temp.lastIndexOf(" Подразумевани напон искључења"))
            temp = temp.slice(26, temp.length);
            return temp !== key;
          });
        }
      }
    }

    if (this.selectedCategory === "MPPT") {
      for (var key of Array.from(this.amperages.keys())) {
        if (!this.amperages.get(key)) {
          this.filteredItems = this.filteredItems.filter(item => {
            var temp = item.description;
            temp = temp.slice(temp.lastIndexOf("Максимална струја пуњења: "),
              temp.lastIndexOf(" Ефективност конверзије"))
            temp = temp.slice(26, temp.length);
            return temp !== key;
          });
        }
      }
    }

    if (this.selectedCategory === "OFF-Grid") {
      for (var key of Array.from(this.wattages.keys())) {
        if (!this.wattages.get(key)) {
          this.filteredItems = this.filteredItems.filter(item => {
            var temp = item.description;
            temp = temp.slice(temp.lastIndexOf("Излазна снага: "),
              temp.lastIndexOf(" Излазна снага у"))
            temp = temp.slice(15, temp.length);
            return temp !== key;
          });
        }
      }
    }

    if (this.selectedCategory === "ON-Grid") {
      for (var key of Array.from(this.wattages.keys())) {
        if (!this.wattages.get(key)) {
          this.filteredItems = this.filteredItems.filter(item => {
            var temp = item.description;
            temp = temp.slice(temp.lastIndexOf("Максимала препоручена снага система:"),
              temp.lastIndexOf(" Улазни напон:"))
            temp = temp.slice(36, temp.length);
            return temp !== key;
          });
        }
      }
    }

    if (this.selectedCategory === "Хибридни") {
      for (var key of Array.from(this.wattages.keys())) {
        if (!this.wattages.get(key)) {
          this.filteredItems = this.filteredItems.filter(item => {
            var temp = item.description;
            temp = temp.slice(temp.lastIndexOf("Снага система: "),
              temp.lastIndexOf(" Снага система у пику"))
            temp = temp.slice(15, temp.length);
            return temp !== key;
          });
        }
      }
    }

    if (this.selectedCategory === "Хоризонтални" || this.selectedCategory === "Вертикални") {
      for (var key of Array.from(this.wattages.keys())) {
        if (!this.wattages.get(key)) {
          this.filteredItems = this.filteredItems.filter(item => {
            var temp = item.description;
            temp = temp.slice(temp.lastIndexOf("Излазна снага: "),
              temp.lastIndexOf(" Максимална излазна снага"))
            temp = temp.slice(15, temp.length);
            return temp !== key;
          });
        }
      }
    }

    if (this.selectedCategory === "Оловни" || this.selectedCategory === "Никл базирани") {
      for (var key of Array.from(this.amperhours.keys())) {
        if (!this.amperhours.get(key)) {
          this.filteredItems = this.filteredItems.filter(item => {
            var temp = item.description;
            temp = temp.slice(temp.lastIndexOf("Максимални капацитет: "),
              temp.lastIndexOf(" Радна температура"))
            temp = temp.slice(22, temp.length);
            return temp !== key;
          });
        }
      }
    }

    if (this.selectedCategory === "Литијумски" || this.selectedCategory === "Специјални") {
      for (var key of Array.from(this.amperhours.keys())) {
        if (!this.amperhours.get(key)) {
          this.filteredItems = this.filteredItems.filter(item => {
            var temp = item.description;
            temp = temp.slice(temp.lastIndexOf("Максимални капацитет: "),
              temp.lastIndexOf(" Максимална дозвољена"))
            temp = temp.slice(22, temp.length);
            return temp !== key;
          });
        }
      }
    }

    if (this.selectedCategory === "Електрична возила") {
      this.filteredItems = this.items.filter(item => {
        var temp = item.description;
        temp = temp.slice(temp.lastIndexOf("Домет при пуној батерији: "),
                            temp.lastIndexOf(" km Број путника:"))
        temp = temp.slice(26, temp.length);
        return parseInt(temp) >= this.minDrivingRange && parseInt(temp) <= this.maxDrivingRange;
      })
    }
  }

  updateVoltages(key: string, value: MatCheckboxChange): void {
    this.voltages.set(key, value.checked);
    this.applyFilters();
  }

  updateAmperages(key: string, value: MatCheckboxChange): void {
    this.amperages.set(key, value.checked);
    this.applyFilters();
  }

  updateWattages(key: string, value: MatCheckboxChange): void {
    this.wattages.set(key, value.checked);
    this.applyFilters();
  }

  updateAmperhours(key: string, value: MatCheckboxChange): void {
    this.amperhours.set(key, value.checked);
    this.applyFilters();
  }

  filterOutVoltage(voltageMin: number, voltageMax: number): void {
    this.filteredItems = this.filteredItems.filter(item => {
      var temp = item.description;
      temp = temp.slice(temp.lastIndexOf("Максимални радни напон: "),
                          temp.lastIndexOf("V Струја кратког споја:"))
      temp = temp.slice(24, temp.length);
      console.log(temp);
      return parseInt(temp) < voltageMin || parseInt(temp) > voltageMax;
    })
  }

  buyProduct(product: Item) {
    
  }

  showComments(product: Item) {
    
  }
}

export { Item, CategoryNode, FlatNode }; //To resolve additional export request by Angular