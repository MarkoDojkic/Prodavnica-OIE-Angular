import { Component, OnInit } from '@angular/core';

export interface Tile {
  color: string;
  cols: number;
  rows: number;
  text: string;
}

@Component({
  selector: 'app-shop',
  templateUrl: './shop.component.html',
  styleUrls: ['./shop.component.css']
})
  
export class ShopComponent implements OnInit {

  num_of_cols: number;

  tiles: Tile[] = [
    { text: 'One', cols: 1, rows: 1, color: 'blue' },
    { text: 'Two', cols: 1, rows: 1, color: 'red' },
    { text: 'Three', cols: 1, rows: 1, color: 'orange' },
    { text: 'Four', cols: 1, rows: 1, color: 'white' },
    { text: 'Five', cols: 1, rows: 1, color: 'green' }
  ];

  constructor() { }

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

}