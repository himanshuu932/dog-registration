import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, RefreshCw, Download } from 'lucide-react';

const PetHome = () => {
  const navigate = useNavigate();

  const services = [
    {
      title: 'New PET Registration',
      description: 'Apply for a new Public Education Token.',
      icon: FileText,
      route: '/reg/pet-new',
    },
    {
      title: 'Re-Registration',
      description: 'Renew your existing PET registration.',
      icon: RefreshCw,
      route: '/reg/pet-rereg',
    },
    {
      title: 'Download Certificate',
      description: 'Download your PET registration certificate.',
      icon: Download,
      route: '/reg/pet-download',
    },
  ];

  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#f9fafb',
      fontFamily: 'sans-serif',
    },
    header: {
      backgroundColor: '#ffffff',
      boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
    },
    headerContent: {
      maxWidth: '1120px',
      margin: '0 auto',
      padding: '16px 24px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    title: {
      fontSize: '1.5rem',
      fontWeight: 600,
      color: '#111827',
    },
    breadcrumb: {
      display: 'flex',
      alignItems: 'center',
      fontSize: '0.875rem',
      color: '#6b7280',
    },
    breadcrumbButton: {
      background: 'none',
      border: 'none',
      color: 'inherit',
      cursor: 'pointer',
      padding: 0,
    },
    separator: {
      margin: '0 8px',
    },
    main: {
      maxWidth: '1120px',
      margin: '32px auto',
      padding: '0 24px',
    },
    sectionTitle: {
      fontSize: '1.25rem',
      fontWeight: 500,
      marginBottom: '24px',
      color: '#111827',
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: '24px',
    },
    card: {
      backgroundColor: '#ffffff',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      borderRadius: '12px',
      display: 'flex',
      flexDirection: 'column',
    },
    cardHeader: {
      display: 'flex',
      alignItems: 'center',
      padding: '16px',
      borderBottom: '1px solid #e5e7eb',
    },
    cardIcon: {
      width: '24px',
      height: '24px',
      color: '#4f46e5',
    },
    cardTitle: {
      marginLeft: '8px',
      fontSize: '1.125rem',
      fontWeight: 600,
      color: '#1f2937',
    },
    cardContent: {
      padding: '16px',
      flexGrow: 1,
    },
    cardDescription: {
      fontSize: '0.875rem',
      color: '#4b5563',
      marginBottom: '16px',
    },
    button: {
      padding: '8px 16px',
      backgroundColor: '#4f46e5',
      color: '#ffffff',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      alignSelf: 'start',
    },
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <h1 style={styles.title}>Public Portal</h1>
          <nav style={styles.breadcrumb} aria-label="Breadcrumb">
            <button
              style={styles.breadcrumbButton}
              onClick={() => navigate('/')}
            >
              Home
            </button>
            <span style={styles.separator}>/</span>
            <span>PET Registration</span>
          </nav>
        </div>
      </header>

      <main style={styles.main}>
        <h2 style={styles.sectionTitle}>Choose a Service</h2>
        <div style={styles.grid}>
          {services.map(({ title, description, icon: Icon, route }) => (
            <div key={title} style={styles.card}>
              <div style={styles.cardHeader}>
                <Icon style={styles.cardIcon} />
                <span style={styles.cardTitle}>{title}</span>
              </div>
              <div style={styles.cardContent}>
                <p style={styles.cardDescription}>{description}</p>
                <button
                  style={styles.button}
                  onClick={() => navigate(route)}
                >
                  Continue
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default PetHome;
