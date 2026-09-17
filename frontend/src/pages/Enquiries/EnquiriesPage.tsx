import { useState, useEffect } from 'react';
import { PageHeader } from '../../components/Layout';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';
import { Plus, FileText } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import type { Enquiry, Customer, Product } from '../../types';

export default function EnquiriesPage() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [formData, setFormData] = useState({
    customerId: '',
    enquiryDate: new Date().toISOString().split('T')[0],
    requiredDate: '',
    notes: '',
  });
  const [items, setItems] = useState<Array<{ productId: string; quantity: string }>>([
    { productId: '', quantity: '' },
  ]);
  const [customerForm, setCustomerForm] = useState({
    companyName: '', contactPerson: '', mobile: '', email: '', city: '',
  });

  const fetchData = async () => {
    try {
      const [enqRes, custRes, prodRes] = await Promise.all([
        api.get('/enquiries'),
        api.get('/customers'),
        api.get('/products'),
      ]);
      setEnquiries(enqRes.data.data);
      setCustomers(custRes.data.data);
      setProducts(prodRes.data.data);
    } catch {
      toast.error('Failed to load data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const addItem = () => setItems([...items, { productId: '', quantity: '' }]);
  const removeItem = (index: number) => {
    if (items.length > 1) setItems(items.filter((_, i) => i !== index));
  };
  const updateItem = (index: number, field: string, value: string) => {
    const updated = [...items];
    (updated[index] as any)[field] = value;
    setItems(updated);
  };

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/customers', customerForm);
      setCustomers([res.data.data, ...customers]);
      setFormData({ ...formData, customerId: String(res.data.data.id) });
      setShowCustomerModal(false);
      setCustomerForm({ companyName: '', contactPerson: '', mobile: '', email: '', city: '' });
      toast.success('Customer created!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create customer.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        customerId: parseInt(formData.customerId),
        enquiryDate: formData.enquiryDate,
        requiredDate: formData.requiredDate || undefined,
        notes: formData.notes || undefined,
        items: items.map((item) => ({
          productId: parseInt(item.productId),
          quantity: parseInt(item.quantity),
        })),
      };
      await api.post('/enquiries', payload);
      toast.success('Enquiry created successfully!');
      setShowModal(false);
      setFormData({ customerId: '', enquiryDate: new Date().toISOString().split('T')[0], requiredDate: '', notes: '' });
      setItems([{ productId: '', quantity: '' }]);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create enquiry.');
    }
  };

  const formatDate = (date: string) => new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  if (isLoading) return <div className="loading-container"><div className="spinner" /></div>;

  return (
    <>
      <PageHeader
        title="Enquiries"
        subtitle="Manage customer enquiries"
        actions={
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={16} /> New Enquiry
          </button>
        }
      />

      {enquiries.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <FileText />
            <p>No enquiries yet. Create your first enquiry!</p>
          </div>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Enquiry #</th>
                <th>Customer</th>
                <th>Products</th>
                <th>Enquiry Date</th>
                <th>Status</th>
                <th>Created By</th>
              </tr>
            </thead>
            <tbody>
              {enquiries.map((enq) => (
                <tr key={enq.id}>
                  <td><span className="font-mono font-bold text-primary-color">{enq.enquiryNumber}</span></td>
                  <td>
                    <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{enq.customer?.companyName}</div>
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>{enq.customer?.city}</div>
                  </td>
                  <td>
                    {enq.items?.map((item) => (
                      <div key={item.id} style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>
                        {item.product?.productName} × {item.quantity}
                      </div>
                    ))}
                  </td>
                  <td>{formatDate(enq.enquiryDate)}</td>
                  <td><StatusBadge status={enq.status} /></td>
                  <td style={{ color: 'var(--text-tertiary)', fontSize: 'var(--font-size-xs)' }}>{enq.user?.name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Enquiry Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Create New Enquiry"
        large
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSubmit}>Create Enquiry</button>
          </>
        }
      >
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Customer</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <select
                  className="form-select"
                  value={formData.customerId}
                  onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                  required
                >
                  <option value="">Select Customer</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>{c.companyName}</option>
                  ))}
                </select>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowCustomerModal(true)}>
                  <Plus size={14} />
                </button>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Enquiry Date</label>
              <input
                type="date"
                className="form-input"
                value={formData.enquiryDate}
                onChange={(e) => setFormData({ ...formData, enquiryDate: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Required Date</label>
              <input
                type="date"
                className="form-input"
                value={formData.requiredDate}
                onChange={(e) => setFormData({ ...formData, requiredDate: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Notes</label>
              <input
                className="form-input"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Optional notes"
              />
            </div>
          </div>

          <div style={{ marginBottom: 'var(--spacing-md)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-md)' }}>
              <label className="form-label" style={{ margin: 0 }}>Products</label>
              <button type="button" className="btn btn-ghost btn-sm" onClick={addItem}>
                <Plus size={14} /> Add Product
              </button>
            </div>
            {items.map((item, index) => (
              <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <select
                  className="form-select"
                  style={{ flex: 3 }}
                  value={item.productId}
                  onChange={(e) => updateItem(index, 'productId', e.target.value)}
                  required
                >
                  <option value="">Select Product</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>{p.productName} ({p.productCode})</option>
                  ))}
                </select>
                <input
                  type="number"
                  className="form-input"
                  style={{ flex: 1 }}
                  placeholder="Qty"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                  required
                />
                {items.length > 1 && (
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => removeItem(index)} style={{ color: 'var(--color-error)' }}>✕</button>
                )}
              </div>
            ))}
          </div>
        </form>
      </Modal>

      {/* Create Customer Modal */}
      <Modal
        isOpen={showCustomerModal}
        onClose={() => setShowCustomerModal(false)}
        title="Create New Customer"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setShowCustomerModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleCreateCustomer}>Create Customer</button>
          </>
        }
      >
        <form onSubmit={handleCreateCustomer}>
          <div className="form-group">
            <label className="form-label">Company Name</label>
            <input className="form-input" value={customerForm.companyName} onChange={(e) => setCustomerForm({ ...customerForm, companyName: e.target.value })} required />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Contact Person</label>
              <input className="form-input" value={customerForm.contactPerson} onChange={(e) => setCustomerForm({ ...customerForm, contactPerson: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">Mobile</label>
              <input className="form-input" value={customerForm.mobile} onChange={(e) => setCustomerForm({ ...customerForm, mobile: e.target.value })} required />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Email</label>
              <input type="email" className="form-input" value={customerForm.email} onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">City</label>
              <input className="form-input" value={customerForm.city} onChange={(e) => setCustomerForm({ ...customerForm, city: e.target.value })} required />
            </div>
          </div>
        </form>
      </Modal>
    </>
  );
}
