// =============================================
// API Response Types
// =============================================

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: Array<{ field: string; message: string }>;
}

// =============================================
// User & Auth
// =============================================

export type Role = 'ADMIN' | 'SALES_USER';

export interface User {
  id: number;
  email: string;
  name: string;
  role: Role;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// =============================================
// Customer
// =============================================

export interface Customer {
  id: number;
  companyName: string;
  contactPerson: string;
  mobile: string;
  email: string;
  city: string;
  createdAt: string;
  updatedAt: string;
}

// =============================================
// Product
// =============================================

export interface Product {
  id: number;
  productCode: string;
  productName: string;
  category: string;
  unit: string;
  basePrice: number;
  createdAt: string;
  updatedAt: string;
  inventory?: Inventory;
}

// =============================================
// Inventory
// =============================================

export interface Inventory {
  id: number;
  productId: number;
  physicalQuantity: number;
  reservedQuantity: number;
  availableQuantity?: number;
  createdAt: string;
  updatedAt: string;
  product?: Product;
}

// =============================================
// Enquiry
// =============================================

export type EnquiryStatus = 'NEW' | 'QUOTED' | 'WON' | 'LOST';

export interface EnquiryItem {
  id: number;
  enquiryId: number;
  productId: number;
  quantity: number;
  product?: Product;
}

export interface Enquiry {
  id: number;
  enquiryNumber: string;
  customerId: number;
  userId: number;
  enquiryDate: string;
  requiredDate?: string;
  notes?: string;
  status: EnquiryStatus;
  createdAt: string;
  updatedAt: string;
  customer?: Customer;
  user?: Partial<User>;
  items?: EnquiryItem[];
  quotations?: Array<{ id: number; quotationNumber: string; status: string }>;
}

// =============================================
// Quotation
// =============================================

export type QuotationStatus = 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED';

export interface QuotationItem {
  id: number;
  quotationId: number;
  productId: number;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  gstPercent: number;
  lineAmount: number;
  product?: Product;
}

export interface Quotation {
  id: number;
  quotationNumber: string;
  enquiryId: number;
  customerId: number;
  userId: number;
  validUntil: string;
  grandTotal: number;
  status: QuotationStatus;
  createdAt: string;
  updatedAt: string;
  customer?: Customer;
  enquiry?: Partial<Enquiry>;
  user?: Partial<User>;
  items?: QuotationItem[];
  salesOrder?: Partial<SalesOrder> | null;
}

// =============================================
// Sales Order
// =============================================

export type SalesOrderStatus = 'PENDING' | 'CONFIRMED' | 'DISPATCHED' | 'CANCELLED';

export interface SalesOrderItem {
  id: number;
  salesOrderId: number;
  productId: number;
  quantity: number;
  unitPrice: number;
  lineAmount: number;
  product?: Product;
}

export interface SalesOrder {
  id: number;
  orderNumber: string;
  quotationId: number;
  customerId: number;
  userId: number;
  orderDate: string;
  totalAmount: number;
  status: SalesOrderStatus;
  createdAt: string;
  updatedAt: string;
  customer?: Customer;
  quotation?: Partial<Quotation>;
  user?: Partial<User>;
  items?: SalesOrderItem[];
  dispatch?: Dispatch | null;
}

// =============================================
// Dispatch
// =============================================

export interface Dispatch {
  id: number;
  dispatchNumber: string;
  salesOrderId: number;
  dispatchDate: string;
  vehicleNumber: string;
  driverName: string;
  createdAt: string;
  updatedAt: string;
}
