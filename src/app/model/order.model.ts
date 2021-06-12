export interface Order {
  id: string;
  placedOn: Date;
  items: { [key: string]:string };
  deliveryAddress: string;
  shippingMethod: "Лично преузимање" | "Курирска служба" | "Пошта";
  status: "Текућа" | "Отказана" | "Завршена";
  subtotal?: number; //Is calculated withing app
  isEditing?: boolean; //Used in order component only
  rating?: number; //Is calculated as average rating of ordered products
}