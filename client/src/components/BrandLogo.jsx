const BrandLogo = ({ collapsed = false, size = 24, light = false }) => {
  if (collapsed) {
    return (
      <span className="pv-logo-wordmark pv-logo-accent" style={{ fontSize: 20 }}>
        PV
      </span>
    );
  }

  return (
    <span className="pv-logo-wordmark" style={{ fontSize: size, color: light ? '#F8FAFC' : '#0F172A' }}>
      Play<span className={light ? 'pv-logo-accent-light' : 'pv-logo-accent'}>verse</span>
    </span>
  );
};

export default BrandLogo;
