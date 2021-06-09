import { Review } from './review.model';
import { Observable } from "rxjs/internal/Observable";

export interface Item {
  id: string;
  title: string;
  imageUrl: Observable<string | null>;
  description: string;
  leftInStock: number;
  price: number;
  orderedQuantity?: number; //Used in indexedDB and expansion panel only
  isEditing?: boolean; //Used in cart component only
  review?: Review;
}