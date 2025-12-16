const LoadingSpinner = ({ text = 'Loading...' }) => (
    <div className="loading-container">
        <div className="spinner" />
        <p style={{ marginTop: 'var(--space-md)', color: 'var(--color-text-muted)' }}>{text}</p>
    </div>
);

export default LoadingSpinner;
