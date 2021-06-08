export interface CategoryNode {
  name: string;
  children?: CategoryNode[];
}

export interface FlatNode {
  expandable: boolean;
  name: string;
  level: number;
}