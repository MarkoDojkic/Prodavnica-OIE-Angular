import { Observable } from "rxjs/internal/Observable";

export interface Item {
  id?: string; //Used in indexedDB only
  title: string;
  imageUrl: Observable<string | null>;
  description: string;
  leftInStock: number;
  price: number;
  orderedQuantity?: number; //Used in indexedDB only
  isEditing?: boolean; //Used in cart component only
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