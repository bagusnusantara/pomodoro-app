import Dashboard from '@components/Dashboard';
import './DashboardPage.css';

function DashboardPage() {
  return (
    <div className="dashboard-page">
      <div className="dashboard-page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Track your productivity and progress</p>
      </div>

      <div className="dashboard-page-content">
        <Dashboard />
      </div>
    </div>
  );
}

export default DashboardPage;
