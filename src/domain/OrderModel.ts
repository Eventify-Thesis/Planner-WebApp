import { QuestionModel } from "./QuestionModel";
import { TicketTypeModel } from "./TicketTypeModel";

export enum OrderStatus {
    PENDING = "PENDING",
    PAID = "PAID",
    PAYMENT_FAILED = "PAYMENT_FAILED",
    CANCELLED = "CANCELLED",
}

export interface OrderModel {
    id: number;
    publicId: string;
    shortId: string;

    userId: string;

    firstName: string;

    lastName: string;

    email: string;

    eventId: number;
    showId: number;

    bookingCode: string;

    status: OrderStatus;

    subtotalAmount: number;

    platformDiscountAmount: number;

    totalAmount: number;

    reservedUntil: Date;

    stripePaymentIntentId: string;

    stripePaymentStatus: string;

    stripePaymentErrorMessage: string;

    stripeCustomerId: string;

    paidAt: Date;

    items: OrderItemModel[];

    createdAt: Date;

    updatedAt: Date;

    attendees: AttendeeModel[];
    bookingAnswers: BookingAnswerModel[];
}

export interface OrderItemModel {
    id: number;

    orderId: number;

    ticketTypeId: number;

    name: string;

    seatId?: string;

    sectionId?: string;

    quantity: number;

    rowLabel: string;

    seatNumber: number;

    price: number;

    createdAt: Date;

    updatedAt: Date;
}

export interface AttendeeModel {
    id: number;
    publicId: string;
    shortId: string;
    firstName: string;

    lastName: string;

    email: string;

    eventId: number;

    showId: number;

    orderId: number;

    seatId: string;

    ticketTypeId: number;

    rowLabel: string;

    seatNumber: number;

    qrCode: string;

    status: string;

    checkedInBy: string;

    checkedInAt: Date;

    checkedOutBy: string;

    checkedOutAt: Date;

    createdAt: Date;

    updatedAt: Date;

    order: OrderModel;

    bookingAnswers: BookingAnswerModel[];
    ticketType: TicketTypeModel;
    checkIn: AttendeeCheckInModel;
}

export interface BookingAnswerModel {
    id: number;
    orderId: number;
    eventId: number;
    showId: number;
    userId: string;
    questionId: number;
    ticketTypeId: number;
    answer: string;
    createdAt: Date;
    updatedAt: Date;

    question: QuestionModel;
}

export interface AttendeeCheckInModel {
    id: number;
    shortId: string;
    attendeeId: number;
    checkInListId: number;
    ticketTypeId: number;
    showId: number;
    eventId: number;
    ipAddress: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
}