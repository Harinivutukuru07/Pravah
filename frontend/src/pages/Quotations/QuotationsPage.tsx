import { useState, useEffect } from 'react';
import { PageHeader } from '../../components/Layout';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';
import { Plus, Send, Check, X, ArrowRightCircle, Receipt } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import type { Quotation, Enquiry, Product } from '../../types';

export default function QuotationsPage() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    enquiryId: '',
    validUntil: '',
  });
  const [items, setItems] = useState<
    Array<{ productId: string; quantity: string; unitPrice: string; discountPercent: string; gstPercent: string }>
  >([{ productId: '', quantity: '', unitPrice: '', discountPercent: '0', gstPercent: '18' }]);

  const fetchData = async () => {
    try {
      const [quotRes, enqRes, prodRes] = await Promise.all([
        api.get('/quotations'),
        api.get('/enquiries'),
        api.get('/products'),
      ]);
      setQuotations(quotRes.data.data);
      setEnquiries(enqRes.data.data);
      setProducts(prodRes.data.data);
    } catch {
      toast.error('Failed to load data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const addItem = () =>
    setItems([...items, { productId: '', quantity: '', unitPrice: '', discountPercent: '0', gstPercent: '18' }]);
  const removeItem = (index: number) => {
    if (items.length > 1) setItems(items.filter((_, i) => i !== index));
  };
  const updateItem = (index: number, field: string, value: string) => {
    const updated = [...items];
    (updated[index] as any)[field] = value;
    setItems(updated);
  };

  const calcLineAmount = (item: (typeof items)[0]) => {
    const qty = parseFloat(item.quantity) || 0;
    const price = parseFloat(item.unitPrice) || 0;
    const disc = parseFloat(item.discountPercent) || 0;
    const gst = parseFloat(item.gstPercent) || 0;
    const base = qty * price;
    const afterDiscount = base * (1 - disc / 100);
    return afterDiscount * (1 + gst / 100);
  };

  const grandTotal = items.reduce((sum, item) => sum + calcLineAmount(item), 0);

  const handleEnquirySelect = (enquiryId: string) => {
    setFormData({ ...formData, enquiryId });
    const enq = enquiries.find((e) => e.id === parseInt(enquiryId));
    if (enq?.items) {
      setItems(
        enq.items.map((item) => {
          const product = products.find((p) => p.id === item.productId);
          return {
            productId: String(item.productId),
            quantity: String(item.quantity),
            unitPrice: String(product?.basePrice || ''),
            discountPercent: '0',
            gstPercent: '18',
          };
        })
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        enquiryId: parseInt(formData.enquiryId),
        validUntil: formData.validUntil,
        items: items.map((item) => ({
          productId: parseInt(item.productId),
          quantity: parseInt(item.quantity),
          unitPrice: parseFloat(item.unitPrice),
          discountPercent: parseFloat(item.discountPercent) || 0,
          gstPercent: parseFloat(item.gstPercent) || 18,
        })),
      };
      await api.post('/quotations', payload);
      toast.success('Quotation created!');
      setShowModal(false);
      resetForm();
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create quotation.');
    }
  };

  const resetForm = () => {
    setFormData({ enquiryId: '', validUntil: '' });
    setItems([{ productId: '', quantity: '', unitPrice: '', discountPercent: '0', gstPercent: '18' }]);
  };

  const handleStatusUpdate = async (id: number, status: string) => {
    try {
      await api.patch(`/quotations/${id}/status`, { status });
      toast.success(`Quotation ${status.toLowerCase()}!`);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update status.');
    }
  };

  const handleConvert = async (id: number) => {
    try {
      await api.post(`/quotations/${id}/convert`);
      toast.success('Sales Order created!');
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to convert.');
    }
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  if (isLoading) return <div className="loading-container"><div className="spinner" /></div>;

  return (
    <>
      <PageHeader
        title="Quotations"
        subtitle="Create and manage quotations"
        actions={
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={16} /> New Quotation
          </button>
        }
      />

      {quotations.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <Receipt />
            <p>No quotations yet. Create your first quotation!</p>
          </div>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Quotation #</th>
                <th>Enquiry</th>
                <th>Customer</th>
                <th>Grand Total</th>
                <th>Valid Until</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {quotations.map((q) => (
                <tr key={q.id}>
                  <td><span className="font-mono font-bold text-primary-color">{q.quotationNumber}</span></td>
                  <td style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>
                    {q.enquiry?.enquiryNumber}
                  </td>
                  <td>
                    <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{q.customer?.companyName}</div>
                  </td>
                  <td className="currency font-bold">{formatCurrency(q.grandTotal)}</td>
                  <td>{formatDate(q.validUntil)}</td>
                  <td><StatusBadge status={q.status} /></td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {q.status === 'DRAFT' && (
                        <button className="btn btn-warning btn-sm" onClick={() => handleStatusUpdate(q.id, 'SENT')}>
                          <Send size={12} /> Send
                        </button>
                      )}
                      {q.status === 'SENT' && (
                        <>
                          <button className="btn btn-success btn-sm" onClick={() => handleStatusUpdate(q.id, 'ACCEPTED')}>
                            <Check size={12} /> Accept
                          </button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleStatusUpdate(q.id, 'REJECTED')}>
                            <X size={12} /> Reject
                          </button>
                        </>
                      )}
                      {q.status === 'ACCEPTED' && !q.salesOrder && (
                        <button className="btn btn-primary btn-sm" onClick={() => handleConvert(q.id)}>
                          <ArrowRightCircle size={12} /> Convert to SO
                        </button>
                      )}
                      {q.salesOrder && (
                        <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>
                          → {q.salesOrder.orderNumber}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Quotation Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); resetForm(); }}
        title="Create New Quotation"
        large
        footer={
          <>
            <div style={{ flex: 1, fontSize: 'var(--font-size-lg)', fontWeight: 700, color: 'var(--color-accent)' }}>
              Total: {formatCurrency(grandTotal)}
            </div>
            <button className="btn btn-secondary" onClick={() => { setShowModal(false); resetForm(); }}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSubmit}>Create Quotation</button>
          </>
        }
      >
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Enquiry</label>
              <select
                className="form-select"
                value={formData.enquiryId}
                onChange={(e) => handleEnquirySelect(e.target.value)}
                required
              >
                <option value="">Select Enquiry</option>
                {enquiries
                  .filter((e) => e.status === 'NEW' || e.status === 'QUOTED')
                  .map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.enquiryNumber} — {e.customer?.companyName}
                    </option>
                  ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Valid Until</label>
              <input
                type="date"
                className="form-input"
                value={formData.validUntil}
                onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                required
              />
            </div>
          </div>

          <div style={{ marginBottom: 'var(--spacing-md)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-md)' }}>
              <label className="form-label" style={{ margin: 0 }}>Line Items</label>
              <button type="button" className="btn btn-ghost btn-sm" onClick={addItem}>
                <Plus size={14} /> Add Item
              </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ minWidth: '700px' }}>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Qty</th>
                    <th>Unit Price (₹)</th>
                    <th>Disc %</th>
                    <th>GST %</th>
                    <th>Line Amt</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={index}>
                      <td style={{ padding: '4px 8px' }}>
                        <select
                          className="form-select"
                          value={item.productId}
                          onChange={(e) => {
                            updateItem(index, 'productId', e.target.value);
                            const prod = products.find((p) => p.id === parseInt(e.target.value));
                            if (prod) updateItem(index, 'unitPrice', String(prod.basePrice));
                          }}
                          required
                        >
                          <option value="">Select</option>
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>{p.productName}</option>
                          ))}
                        </select>
                      </td>
                      <td style={{ padding: '4px 8px' }}>
                        <input type="number" className="form-input" style={{ width: '70px' }} min="1" value={item.quantity} onChange={(e) => updateItem(index, 'quantity', e.target.value)} required />
                      </td>
                      <td style={{ padding: '4px 8px' }}>
                        <input type="number" className="form-input" style={{ width: '100px' }} step="0.01" min="0" value={item.unitPrice} onChange={(e) => updateItem(index, 'unitPrice', e.target.value)} required />
                      </td>
                      <td style={{ padding: '4px 8px' }}>
                        <input type="number" className="form-input" style={{ width: '60px' }} min="0" max="100" value={item.discountPercent} onChange={(e) => updateItem(index, 'discountPercent', e.target.value)} />
                      </td>
                      <td style={{ padding: '4px 8px' }}>
                        <input type="number" className="form-input" style={{ width: '60px' }} min="0" value={item.gstPercent} onChange={(e) => updateItem(index, 'gstPercent', e.target.value)} />
                      </td>
                      <td style={{ padding: '4px 8px', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {formatCurrency(calcLineAmount(item))}
                      </td>
                      <td style={{ padding: '4px 8px' }}>
                        {items.length > 1 && (
                          <button type="button" className="btn btn-ghost btn-sm" onClick={() => removeItem(index)} style={{ color: 'var(--color-error)' }}>✕</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </form>
      </Modal>
    </>
  );
}
