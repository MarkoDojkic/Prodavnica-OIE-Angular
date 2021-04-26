import { Component, OnInit } from '@angular/core';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';

export interface Tile {
  color: string;
  cols: number;
  rows: number;
  text: string;
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

  tiles: Tile[] = [
    { text: 'One', cols: 1, rows: 1, color: 'blue' },
    { text: 'Two', cols: 1, rows: 1, color: 'red' },
    { text: 'Three', cols: 1, rows: 1, color: 'orange' },
    { text: 'Four', cols: 1, rows: 1, color: 'white' },
    { text: 'Five', cols: 1, rows: 1, color: 'green' }
  ];

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

  constructor() {
    this.categoriesSource.data = [ //Replace with category names from firebase firestore
      {
        name: 'Fruit',
        children: [
          {name: 'Apple'},
          {name: 'Banana'},
          {name: 'Fruit loops'},
        ]
      }, {
        name: 'Vegetables',
        children: [
          {
            name: 'Green',
            children: [
              {name: 'Broccoli'},
              {name: 'Brussels sprouts'},
            ]
          }, {
            name: 'Orange',
            children: [
              {name: 'Pumpkins'},
              {name: 'Carrots'},
            ]
          },
        ]
      }
    ];
  }

  hasChild = (_: number, node: FlatNode) => node.expandable;

  ngOnInit(): void {
    if (window.innerWidth <= 1920 && window.innerWidth > 1280)
      this.num_of_cols = 4
    else if (window.innerWidth <= 1280 && window.innerWidth > 960)
      this.num_of_cols = 3
    else if (window.innerWidth <= 960 && window.innerWidth > 600)
      this.num_of_cols = 2
    else if (window.innerWidth <= 600)
      this.num_of_cols = 1
    else
      this.num_of_cols = 5
  }

  onResize(event): void {
    if (window.innerWidth <= 1920 && window.innerWidth > 1280)
      this.num_of_cols = 4
    else if (window.innerWidth <= 1280 && window.innerWidth > 960)
      this.num_of_cols = 3
    else if (window.innerWidth <= 960 && window.innerWidth > 600)
      this.num_of_cols = 2
    else if (window.innerWidth <= 600)
      this.num_of_cols = 1
    else
      this.num_of_cols = 5
  }

  displayItems(category: string): void {
    console.log("Display items from category: " + category);
    this.selectedCategory = category;
  }

}