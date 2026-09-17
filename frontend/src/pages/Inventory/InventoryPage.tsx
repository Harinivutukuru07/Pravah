import { useState, useEffect } from 'react';
import { PageHeader } from '../../components/Layout';
import Modal from '../../components/Modal';
import { Package, Edit } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import type { Inventory } from '../../types';

export default function InventoryPage() {
  const { user } = useAuth();
  const [inventory, setInventory] = useState<Inventory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editProductId, setEditProductId] = useState<number | null>(null);
  const [editQuantity, setEditQuantity] = useState('');

  const fetchData = async () => {
    try {
      const res = await api.get('/inventory');
      setInventory(res.data.data);
    } catch {
      toast.error('Failed to load inventory.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editProductId) return;
    try {
      await api.patch(`/inventory/${editProductId}`, {
        physicalQuantity: parseInt(editQuantity),
      });
      toast.success('Inventory updated!');
      setShowEditModal(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update inventory.');
    }
  };

  const isAdmin = user?.role === 'ADMIN';

  if (isLoading) return <div className="loading-container"><div className="spinner" /></div>;

  return (
    <>
      <PageHeader title="Inventory" subtitle="View and manage product inventory" />

      <div className="stats-grid" style={{ marginBottom: 'var(--spacing-xl)' }}>
        <div className="stat-card">
          <div className="stat-icon primary">
            <Package size={22} />
          </div>
          <div>
            <div className="stat-value">{inventory.length}</div>
            <div className="stat-label">Total Products</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon success">
            <Package size={22} />
          </div>
          <div>
            <div className="stat-value">
              {inventory.reduce((sum, inv) => sum + (inv.availableQuantity || 0), 0)}
            </div>
            <div className="stat-label">Total Available Units</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon warning">
            <Package size={22} />
          </div>
          <div>
            <div className="stat-value">
              {inventory.reduce((sum, inv) => sum + inv.reservedQuantity, 0)}
            </div>
            <div className="stat-label">Total Reserved Units</div>
          </div>
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Product Code</th>
              <th>Product Name</th>
              <th>Category</th>
              <th>Unit</th>
              <th className="text-right">Physical</th>
              <th className="text-right">Reserved</th>
              <th className="text-right">Available</th>
              {isAdmin && <th>Action</th>}
            </tr>
          </thead>
          <tbody>
            {inventory.map((inv) => {
              const available = inv.availableQuantity ?? (inv.physicalQuantity - inv.reservedQuantity);
              const isLow = available < 20;
              return (
                <tr key={inv.id}>
                  <td><span className="font-mono" style={{ color: 'var(--color-primary)' }}>{inv.product?.productCode}</span></td>
                  <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{inv.product?.productName}</td>
                  <td>{inv.product?.category}</td>
                  <td>{inv.product?.unit}</td>
                  <td className="text-right font-mono">{inv.physicalQuantity}</td>
                  <td className="text-right font-mono" style={{ color: inv.reservedQuantity > 0 ? 'var(--color-warning)' : 'var(--text-secondary)' }}>
                    {inv.reservedQuantity}
                  </td>
                  <td className="text-right font-mono font-bold" style={{ color: isLow ? 'var(--color-error)' : 'var(--color-success)' }}>
                    {available}
                  </td>
                  {isAdmin && (
                    <td>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => {
                          setEditProductId(inv.productId);
                          setEditQuantity(String(inv.physicalQuantity));
                          setShowEditModal(true);
                        }}
                      >
                        <Edit size={12} /> Edit
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Edit Inventory Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Update Physical Quantity"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setShowEditModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleUpdate}>Update</button>
          </>
        }
      >
        <form onSubmit={handleUpdate}>
          <div className="form-group">
            <label className="form-label">
              Product: {inventory.find((i) => i.productId === editProductId)?.product?.productName}
            </label>
          </div>
          <div className="form-group">
            <label className="form-label">Physical Quantity</label>
            <input
              type="number"
              className="form-input"
              value={editQuantity}
              onChange={(e) => setEditQuantity(e.target.value)}
              min="0"
              required
            />
          </div>
        </form>
      </Modal>
    </>
  );
}
