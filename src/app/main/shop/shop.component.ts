import { Component, OnInit } from '@angular/core';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { FirebaseService } from 'src/app/auth/firebase/firebase.service';
import { Observable } from 'rxjs/internal/Observable';

export interface Item {
  title: string,
  imageUrl: Observable<string | null>,
  description: string,
  leftInStock: number,
  price: number
}

interface CategoryNode {
  name: string;
  children?: CategoryNode[];
}

interface FlatNode {
  expandable: boolean;
  name: string;
  level: number;
}

@Component({
  selector: 'app-shop',
  templateUrl: './shop.component.html',
  styleUrls: ['./shop.component.css']
})
  
export class ShopComponent implements OnInit {

  num_of_cols: number;
  selectedCategory: string;
  items: Array<Item>;

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

  constructor(private fs:FirebaseService) {
    this.categoriesSource.data = [
      {
        name: 'Соларни панели',
        children: [
          {name: 'Монокристални'},
          {name: 'Поликристални'},
          {name: 'Аморфни'},
        ] //Add more categoryItems here
      },
    ];
  }

  hasChild = (_: number, node: FlatNode) => node.expandable;

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
  }

}