import { Observable } from "rxjs/internal/Observable";

export interface Item {
  title: string;
  imageUrl: Observable<string | null>;
  description: string;
  leftInStock: number;
  price: number;
  orderedQuantity?: string;
}

export interface CategoryNode {
  name: string;
  children?: CategoryNode[];
}

export interface FlatNode {
  expandable: boolean;
  name: string;
  level: number;
}