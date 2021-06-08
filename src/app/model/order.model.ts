export interface Order {
  id: string;
  placedOn: Date;
  items: { [key: string]:number };
  shippingAddress: string;
  shippingMethod: "Лично преузимање" | "Курирска служба" | "Пошта";
  status: "Текућа" | "Отказана" | "Завршена";
  totalPrice: number;
  isEditing?: boolean; //Used in order component only
}