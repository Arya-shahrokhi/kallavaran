export default function Logo({ className = '' }) {
  return (
    <img
      src="/images/brand/kalavaran-logo.png"
      width="996"
      height="942"
      className={`object-contain ${className}`}
      alt=""
      aria-hidden="true"
      decoding="async"
      draggable="false"
    />
  );
}
