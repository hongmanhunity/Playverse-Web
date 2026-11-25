const BrandLogo = ({ collapsed = false, size = 24 }) => {
  if (collapsed) {
    return (
      <span className="pv-logo-wordmark pv-logo-accent" style={{ fontSize: 20 }}>
        PV
      </span>
    );
  }

  return (
    <span className="pv-logo-wordmark" style={{ fontSize: size, color: '#0F172A' }}>
      Play<span className="pv-logo-accent">verse</span>
    </span>
  );
};

export default BrandLogo;
