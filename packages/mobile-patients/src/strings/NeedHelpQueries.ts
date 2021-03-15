export interface NeedHelpQuery {
  id: number;
  title: string;
  nonOrderQueries?: NeedHelpQuery['id'][];
  queriesByOrderStatus?: { [key: string]: NeedHelpQuery['id'][] };
  queries: NeedHelpQuery[] | null;
}

export const NeedHelpQueries: NeedHelpQuery[] = [
  {
    id: 1,
    title: 'Pharmacy',
    nonOrderQueries: [10, 11],
    queriesByOrderStatus: {
      QUOTE: [13, 8, 4, 7, 12],
      PAYMENT_SUCCESS: [13, 8, 4, 7, 12],
      PAYMENT_PENDING: [13, 8, 4, 7, 12],
      PAYMENT_FAILED: [13, 8, 4, 7, 12],
      ORDER_INITIATED: [13, 8, 4, 7, 12],
      PRESCRIPTION_UPLOADED: [13, 8, 4, 7, 12],
      ORDER_FAILED: [13, 8, 4, 7, 12],
      PRESCRIPTION_CART_READY: [13, 8, 4, 7, 12],
      ORDER_CONFIRMED: [13, 8, 4, 7, 12],
      PAYMENT_ABORTED: [13, 8, 4, 7, 12],
      ORDER_PLACED: [13, 8, 4, 7, 12],
      ON_HOLD: [13, 8, 4, 7, 12],
      READY_FOR_VERIFICATION: [13, 8, 4, 7, 12],
      CONSULT_PENDING: [13, 8, 4, 7, 12],
      CONSULT_COMPLETED: [13, 8, 4, 7, 12],
      VERIFICATION_DONE: [13, 8, 4, 7, 12],
      ORDER_VERIFIED: [13, 8, 4, 7, 12],
      ORDER_BILLED: [13, 8, 7, 12],
      READY_AT_STORE: [13, 8, 7, 12],
      OUT_FOR_DELIVERY: [13, 8, 7, 12],
      PICKEDUP: [13, 8, 7, 12],
      SHIPPED: [13, 8, 7, 12],
      DELIVERY_ATTEMPTED: [13, 8, 7, 12],
      DELIVERED: [3, 14, 5, 2, 9, 12],
      PURCHASED_IN_STORE: [3, 14, 5, 2, 9, 12],
      CANCELLED: [3, 14, 5, 2, 9, 12],
      CANCEL_REQUEST: [3, 14, 5, 2, 9, 12],
      RETURN_INITIATED: [3, 14, 5, 2, 9, 12],
      ITEMS_RETURNED: [3, 14, 5, 2, 9, 12],
      RETURN_ACCEPTED: [3, 14, 5, 2, 9, 12],
      RETURN_PENDING: [3, 14, 5, 2, 9, 12],
      RETURN_TO_ORIGIN: [3, 14, 5, 2, 9, 12],
      RETURN_REQUESTED: [3, 14, 5, 2, 9, 12],
      RVP_ASSIGNED: [3, 14, 5, 2, 9, 12],
      RETURN_PICKUP: [3, 14, 5, 2, 9, 12],
      RETURN_RTO: [3, 14, 5, 2, 9, 12],
      READY_TO_SHIP: [3, 14, 5, 2, 9, 12],
    },
    queries: [
      {
        id: 1,
        title: 'I want to return my order',
        queries: null,
      },
      {
        id: 2,
        title: 'Excess amount was charged to me by Delivery Executive',
        queries: null,
      },
      {
        id: 3,
        title: 'I have issues in order delivered!',
        queries: [
          {
            id: 1,
            title: 'Damaged Items',
            queries: null,
          },
          {
            id: 2,
            title: 'Partial Delivery / Wrong quantity',
            queries: null,
          },
          {
            id: 3,
            title: 'Wrong Items were delivered',
            queries: null,
          },
          {
            id: 4,
            title: 'Incorrect bill or pricing',
            queries: null,
          },
          {
            id: 5,
            title: 'Expiry date related',
            queries: null,
          },
          {
            id: 6,
            title: 'Other issues',
            queries: null,
          },
        ],
      },
      {
        id: 4,
        title: 'I have prescription related queries (Invalid/ Order cancelled)',
        queries: null,
      },
      {
        id: 5,
        title: 'I need to know my refund status',
        queries: null,
      },
      {
        id: 6,
        title: 'I need to know why my order was cancelled',
        queries: null,
      },
      {
        id: 7,
        title: 'I would like to cancel the order!',
        queries: null,
      },
      {
        id: 8,
        title: 'I would like to know the Delivery status of my order.',
        queries: null,
      },
      {
        id: 9,
        title: 'Inappropriate attitude & behaviour of Delivery Executive',
        queries: null,
      },
      {
        id: 10,
        title: 'I was not able to place the order due to technical errors',
        queries: null,
      },
      {
        id: 11,
        title: 'My money got deducted but no order confirmation received',
        queries: null,
      },
      {
        id: 12,
        title: 'Other issues',
        queries: null,
      },
      {
        id: 13,
        title: 'My order is getting Delayed',
        queries: null,
      },
      {
        id: 14,
        title: 'I would like to return the order',
        queries: null,
      },
    ],
  },
  {
    id: 2,
    title: 'Virtual/Online Consult',
    nonOrderQueries: [9, 10],
    queries: [
      {
        id: 1,
        title: 'Consultation ended, Doctor has not replied to my query over 24 hours',
        queries: null,
      },
      {
        id: 2,
        title: 'I did not receive invoice/ receipt of my appointment',
        queries: null,
      },
      {
        id: 3,
        title: 'I faced technical issues during/after booking an appointment',
        queries: null,
      },
      {
        id: 4,
        title: 'I haven’t received the prescription',
        queries: null,
      },
      {
        id: 5,
        title: 'I need to know my refund status',
        queries: null,
      },
      {
        id: 6,
        title: 'I want to reschedule/cancel my appointment ',
        queries: null,
      },
      {
        id: 7,
        title: 'Improper behaviour/attitude of doctor or staff',
        queries: null,
      },
      {
        id: 8,
        title: 'The doctor did not start the consultation call on time',
        queries: null,
      },
      {
        id: 9,
        title: 'I am unable to book an appointment (slot not available/ Doctor not listed)',
        queries: null,
      },
      {
        id: 10,
        title: 'My money got deducted but no confirmation on the doctor appointment',
        queries: null,
      },
    ],
  },
  {
    id: 3,
    title: 'Health Records',
    queries: [
      {
        id: 1,
        title: 'Add multiple UHID’s linked to other mobile numbers',
        queries: null,
      },
      {
        id: 2,
        title: 'Delay in responses to queries',
        queries: null,
      },
      {
        id: 3,
        title: 'Incomplete health records',
        queries: null,
      },
      {
        id: 4,
        title: 'Issues in downloading the records',
        queries: null,
      },
      {
        id: 5,
        title: 'No / Wrong UHID',
        queries: null,
      },
      {
        id: 6,
        title: 'No records available for linked UHID',
        queries: null,
      },
      {
        id: 7,
        title: 'Personal details are not editable',
        queries: null,
      },
      {
        id: 8,
        title: 'Unable to see my reports',
        queries: null,
      },
      {
        id: 9,
        title: 'Unable to add family members',
        queries: null,
      },
    ],
  },
  {
    id: 4,
    title: 'Physical Consult',
    queries: [
      {
        id: 1,
        title: 'App appointment dishonored at confirmed time slot',
        queries: null,
      },
      {
        id: 2,
        title: 'Application issues(bandwidth & payment errors)',
        queries: null,
      },
      {
        id: 3,
        title: 'Behavior and attitude of the doctor',
        queries: null,
      },
      {
        id: 4,
        title: "Can't find doctor’s name in respective list",
        queries: null,
      },
      {
        id: 5,
        title: 'Delayed prescription',
        queries: null,
      },
      {
        id: 6,
        title: 'Doctor not available',
        queries: null,
      },
      {
        id: 7,
        title: 'Long waiting time for physical consult',
        queries: null,
      },
      {
        id: 8,
        title: 'No past / upcoming consultation details',
        queries: null,
      },
      {
        id: 9,
        title: 'No updates on delays, reschedules or cancellations of the consult',
        queries: null,
      },
      {
        id: 10,
        title: 'Payment issues',
        queries: null,
      },
      {
        id: 11,
        title: 'Require reschedule',
        queries: null,
      },
      {
        id: 12,
        title: 'Refund required',
        queries: null,
      },
      {
        id: 13,
        title: 'Discount / Promotions / Voucher issues',
        queries: null,
      },
    ],
  },
  {
    id: 5,
    title: 'Feedback',
    queries: [
      {
        id: 1,
        title: 'Feedback on app',
        queries: null,
      },
      {
        id: 2,
        title: 'Feedback on consultation',
        queries: null,
      },
      {
        id: 3,
        title: 'Feedback on health records',
        queries: null,
      },
      {
        id: 4,
        title: 'Feedback on medicine deliver',
        queries: null,
      },
    ],
  },
  {
    id: 6,
    title: 'Diagnostics',
    queries: [
      {
        id: 1,
        title: 'Delay in sample Pick-up collection, Need urgent help',
        queries: null,
      },
      {
        id: 2,
        title: 'I need to know my refund status',
        queries: null,
      },
      {
        id: 3,
        title: 'Issue In Order Confirmation (Payment etc.)',
        queries: null,
      },
      {
        id: 4,
        title: 'I Need to Reschedule Pick up time',
        queries: null,
      },
      {
        id: 5,
        title: 'Report Not Received',
        queries: null,
      },
      {
        id: 6,
        title: 'Wrong Report Received',
        queries: null,
      },
      {
        id: 7,
        title: 'My order was cancelled without prior Information',
        queries: null,
      },
      {
        id: 8,
        title: 'High Listing Price on app or website',
        queries: null,
      },
      {
        id: 9,
        title: 'Sample Pick Up Staff Related feedback',
        queries: null,
      },
      {
        id: 10,
        title: 'I need to Cancel my pick up',
        queries: null,
      },
    ],
  },
  {
    id: 7,
    title: 'Unsubscribe',
    queries: [
      {
        id: 1,
        title: 'Marketing SMSes',
        queries: null,
      },
      {
        id: 2,
        title: 'Marketing Push Notifications',
        queries: null,
      },
      {
        id: 3,
        title: 'Both',
        queries: null,
      },
    ],
  },
  {
    id: 8,
    title: 'HealthyLife (HDFC)',
    queries: [
      {
        id: 1,
        title: 'Coupon related',
        queries: null,
      },
      {
        id: 2,
        title: 'Concierge Services',
        queries: null,
      },
      {
        id: 3,
        title: 'Digitization of Health Records',
        queries: null,
      },
      {
        id: 4,
        title: 'Covid Services',
        queries: null,
      },
      {
        id: 5,
        title: 'OneApollo Membership',
        queries: null,
      },
      {
        id: 6,
        title: 'Doctor on Call',
        queries: null,
      },
      {
        id: 7,
        title: 'Early Access to Offers & Sampling of New health products',
        queries: null,
      },
      {
        id: 8,
        title: 'Free Delivery',
        queries: null,
      },
      {
        id: 9,
        title: 'Base Diabetes Management Program',
        queries: null,
      },
      {
        id: 10,
        title: 'Advanced Diabetes Management Program Trial',
        queries: null,
      },
      {
        id: 11,
        title: 'Activating Membership',
        queries: null,
      },
      {
        id: 12,
        title: 'Membership Upgrade',
        queries: null,
      },
      {
        id: 13,
        title: 'Membership Downgrade',
        queries: null,
      },
    ],
  },
  {
    id: 9,
    title: 'Circle Membership',
    queries: [
      {
        id: 1,
        title: 'Details about Circle Membership',
        queries: null,
      },
      {
        id: 2,
        title: 'Regarding Circle Benefits',
        queries: null,
      },
      {
        id: 3,
        title: 'Plans available for Circle Membership',
        queries: null,
      },
      {
        id: 4,
        title: 'Signing Up for Circle Membership',
        queries: null,
      },
      {
        id: 5,
        title: 'Buying Circle Membership using OneApollo Health Credits',
        queries: null,
      },
      {
        id: 6,
        title: 'About Circle Cashback',
        queries: null,
      },
      {
        id: 7,
        title: 'How to use Circle Cashback',
        queries: null,
      },
      {
        id: 8,
        title: 'Membership Cancellation',
        queries: null,
      },
      {
        id: 9,
        title: 'Changing Membership Plan',
        queries: null,
      },
      {
        id: 10,
        title: 'How to get free delivery with Circle',
        queries: null,
      },
      {
        id: 11,
        title: 'Covid Care Benefit with Circle',
        queries: null,
      },
      {
        id: 12,
        title: 'Regarding Digitization of Patient Health Records',
        queries: null,
      },
      {
        id: 13,
        title: 'Regarding Doctor on Call',
        queries: null,
      },
      {
        id: 14,
        title: 'Regarding Advanced Diabetes Management Program',
        queries: null,
      },
      {
        id: 15,
        title: 'Special Offers and Discounts with Circle Membership',
        queries: null,
      },
    ],
  },
];
