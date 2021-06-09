export interface Review {
    reviewedBy: string;
    authorName?: string;
    authorSurname?: string;
    orderId: string;
    productId: string;
    rating: number;
    comment: string;
    lastChange?: any; /* Timestamp on firebase server, a.k.a FieldValue => to use just convert using .toDate() */
    isAnonymous?: boolean;
}