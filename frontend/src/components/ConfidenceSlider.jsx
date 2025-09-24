export default function ConfidenceSlider({ value, onChange }) {
  return (
    <div className="mb-4">
      <label className="block mb-1">Confidence: {value}%</label>
      <input
        type="range"
        min="0"
        max="100"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full"
      />
    </div>
  );
}
