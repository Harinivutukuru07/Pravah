import { useEffect, useState } from 'react';
import { PageHeader } from '../../components/Layout';
import { useAuth } from '../../context/AuthContext';
import { FileText, Receipt, ShoppingCart, Package } from 'lucide-react';
import api from '../../services/api';

interface DashboardStats {
  enquiries: number;
  quotations: number;
  salesOrders: number;
  products: number;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    enquiries: 0,
    quotations: 0,
    salesOrders: 0,
    products: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [enq, quot, so, prod] = await Promise.all([
          api.get('/enquiries'),
          api.get('/quotations'),
          api.get('/sales-orders'),
          api.get('/products'),
        ]);
        setStats({
          enquiries: enq.data.data.length,
          quotations: quot.data.data.length,
          salesOrders: so.data.data.length,
          products: prod.data.data.length,
        });
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      }
    };
    fetchStats();
  }, []);

  return (
    <>
      <PageHeader
        title={`Welcome back, ${user?.name?.split(' ')[0]}`}
        subtitle={`${user?.role === 'ADMIN' ? 'Administrator' : 'Sales User'} Dashboard`}
      />

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon primary">
            <FileText size={22} />
          </div>
          <div>
            <div className="stat-value">{stats.enquiries}</div>
            <div className="stat-label">Total Enquiries</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon warning">
            <Receipt size={22} />
          </div>
          <div>
            <div className="stat-value">{stats.quotations}</div>
            <div className="stat-label">Total Quotations</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon success">
            <ShoppingCart size={22} />
          </div>
          <div>
            <div className="stat-value">{stats.salesOrders}</div>
            <div className="stat-label">Sales Orders</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon accent">
            <Package size={22} />
          </div>
          <div>
            <div className="stat-value">{stats.products}</div>
            <div className="stat-label">Products</div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Business Workflow</h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', padding: '8px 0' }}>
          {['Customer', 'Enquiry', 'Quotation', 'Sales Order', 'Reservation', 'Dispatch'].map(
            (step, i) => (
              <div key={step} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    padding: '8px 16px',
                    background: 'var(--color-primary-light)',
                    color: 'var(--color-primary)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: 'var(--font-size-sm)',
                    fontWeight: 600,
                  }}
                >
                  {step}
                </div>
                {i < 5 && (
                  <span style={{ color: 'var(--text-muted)', fontSize: '18px' }}>→</span>
                )}
              </div>
            )
          )}
        </div>
      </div>
    </>
  );
}
