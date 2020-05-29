export interface IPayment {
  id: string;
  doctorId: string;
  displayId?: string;
  appointmentDateTime: string;
  actualAmount: string;
  appointmentType?: string;
  appointmentPayments?: any;
  doctor?: any;
}

export interface IPaymentProps {
  item: IPayment;
}