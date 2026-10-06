import { initials } from '../lib/store';

const PALETTE = ['677406', '3C671E', '22593D', '72471D', '244C4C', '574B0F'];
function colorFor(name) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return PALETTE[h % PALETTE.length];
}

export default function Avatar({ name, size = 40 }) {
  return (
    <span
      className="avatar"
      style={{ width: size, height: size, fontSize: size * 0.4, background: `#${colorFor(name)}` }}
      aria-hidden="true"
    >
      {initials(name)}
    </span>
  );
}
