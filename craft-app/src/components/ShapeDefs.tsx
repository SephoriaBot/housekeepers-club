// Hidden SVG holding the clip-path definitions for
// .shape-heart and .shape-teddy (see theme.css).
// objectBoundingBox units mean these scale to fit any element.
export default function ShapeDefs() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
      <defs>
        <clipPath id="polly-heart-clip" clipPathUnits="objectBoundingBox">
          <path d="M0.50,0.88 C0.10,0.60 0.00,0.35 0.00,0.20 C0.00,0.05 0.15,-0.05 0.30,0.05 C0.40,0.12 0.47,0.22 0.50,0.30 C0.53,0.22 0.60,0.12 0.70,0.05 C0.85,-0.05 1.00,0.05 1.00,0.20 C1.00,0.35 0.90,0.60 0.50,0.88 Z" />
        </clipPath>
        <clipPath id="polly-teddy-clip" clipPathUnits="objectBoundingBox">
          <path
            fillRule="nonzero"
            d="M0.08,0.58 C0.08,0.348 0.268,0.16 0.5,0.16 C0.732,0.16 0.92,0.348 0.92,0.58 C0.92,0.812 0.732,1.00 0.5,1.00 C0.268,1.00 0.08,0.812 0.08,0.58 Z
               M0.06,0.16 C0.06,0.0716 0.1316,0.00 0.22,0.00 C0.3084,0.00 0.38,0.0716 0.38,0.16 C0.38,0.2484 0.3084,0.32 0.22,0.32 C0.1316,0.32 0.06,0.2484 0.06,0.16 Z
               M0.62,0.16 C0.62,0.0716 0.6916,0.00 0.78,0.00 C0.8684,0.00 0.94,0.0716 0.94,0.16 C0.94,0.2484 0.8684,0.32 0.78,0.32 C0.6916,0.32 0.62,0.2484 0.62,0.16 Z"
          />
        </clipPath>
      </defs>
    </svg>
  );
}
