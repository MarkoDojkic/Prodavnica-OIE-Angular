export interface Order {
  id: string;
  placedOn: Date;
  orderedItems: Map<string, number>;
  shippingAddress: string;
  shippingMethod: "Лично преузимање" | "Курирска служба" | "Пошта";
  status: "Текућа" | "Отказана" | "Завршена";
  totalPrice: number;
  isEditing?: boolean; //Used in order component only
}