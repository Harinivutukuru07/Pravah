import { useState, useEffect } from 'react';
import { PageHeader } from '../../components/Layout';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';
import { CheckCircle, Truck, XCircle, ShoppingCart } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import type { SalesOrder } from '../../types';

export default function SalesOrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [dispatchForm, setDispatchForm] = useState({ vehicleNumber: '', driverName: '' });

  const fetchData = async () => {
    try {
      const res = await api.get('/sales-orders');
      setOrders(res.data.data);
    } catch {
      toast.error('Failed to load sales orders.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleConfirm = async (id: number) => {
    try {
      await api.post(`/sales-orders/${id}/confirm`);
      toast.success('Order confirmed & inventory reserved!');
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to confirm order.');
    }
  };

  const handleDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderId) return;
    try {
      await api.post(`/sales-orders/${selectedOrderId}/dispatch`, dispatchForm);
      toast.success('Order dispatched!');
      setShowDispatchModal(false);
      setDispatchForm({ vehicleNumber: '', driverName: '' });
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to dispatch order.');
    }
  };

  const handleCancel = async (id: number) => {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    try {
      await api.patch(`/sales-orders/${id}/cancel`);
      toast.success('Order cancelled.');
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to cancel order.');
    }
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  const isAdmin = user?.role === 'ADMIN';

  if (isLoading) return <div className="loading-container"><div className="spinner" /></div>;

  return (
    <>
      <PageHeader title="Sales Orders" subtitle="Track and manage sales orders" />

      {orders.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <ShoppingCart />
            <p>No sales orders yet. Convert a quotation to create one.</p>
          </div>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Order #</th>
                <th>Quotation</th>
                <th>Customer</th>
                <th>Products</th>
                <th>Total</th>
                <th>Order Date</th>
                <th>Status</th>
                {isAdmin && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td><span className="font-mono font-bold text-primary-color">{order.orderNumber}</span></td>
                  <td style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>
                    {order.quotation?.quotationNumber}
                  </td>
                  <td>
                    <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{order.customer?.companyName}</div>
                  </td>
                  <td>
                    {order.items?.map((item) => (
                      <div key={item.id} style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>
                        {item.product?.productName} × {item.quantity}
                      </div>
                    ))}
                  </td>
                  <td className="currency font-bold">{formatCurrency(order.totalAmount)}</td>
                  <td>{formatDate(order.orderDate)}</td>
                  <td><StatusBadge status={order.status} /></td>
                  {isAdmin && (
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {order.status === 'PENDING' && (
                          <>
                            <button className="btn btn-success btn-sm" onClick={() => handleConfirm(order.id)}>
                              <CheckCircle size={12} /> Confirm
                            </button>
                            <button className="btn btn-danger btn-sm" onClick={() => handleCancel(order.id)}>
                              <XCircle size={12} /> Cancel
                            </button>
                          </>
                        )}
                        {order.status === 'CONFIRMED' && (
                          <button
                            className="btn btn-warning btn-sm"
                            onClick={() => {
                              setSelectedOrderId(order.id);
                              setShowDispatchModal(true);
                            }}
                          >
                            <Truck size={12} /> Dispatch
                          </button>
                        )}
                        {order.dispatch && (
                          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>
                            {order.dispatch.dispatchNumber}
                          </span>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Dispatch Modal */}
      <Modal
        isOpen={showDispatchModal}
        onClose={() => setShowDispatchModal(false)}
        title="Process Dispatch"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setShowDispatchModal(false)}>Cancel</button>
            <button className="btn btn-warning" onClick={handleDispatch}>
              <Truck size={16} /> Dispatch
            </button>
          </>
        }
      >
        <form onSubmit={handleDispatch}>
          <div className="form-group">
            <label className="form-label">Vehicle Number</label>
            <input
              className="form-input"
              value={dispatchForm.vehicleNumber}
              onChange={(e) => setDispatchForm({ ...dispatchForm, vehicleNumber: e.target.value })}
              placeholder="e.g., KA-01-AB-1234"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Driver Name</label>
            <input
              className="form-input"
              value={dispatchForm.driverName}
              onChange={(e) => setDispatchForm({ ...dispatchForm, driverName: e.target.value })}
              placeholder="Driver's full name"
              required
            />
          </div>
        </form>
      </Modal>
    </>
  );
}
