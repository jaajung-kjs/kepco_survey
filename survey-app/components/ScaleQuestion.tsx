interface Props {
  questionNumber: number;
  questionText: string;
  value: number | null;
  onChange: (value: number) => void;
  required?: boolean;
}

export default function ScaleQuestion({
  questionNumber,
  questionText,
  value,
  onChange,
  required = true,
}: Props) {
  const scales = [
    { value: 1, label: '전혀 그렇지 않다' },
    { value: 2, label: '그렇지 않다' },
    { value: 3, label: '보통이다' },
    { value: 4, label: '그렇다' },
    { value: 5, label: '매우 그렇다' },
  ];

  return (
    <div className="border-b border-gray-200 pb-6 mb-6">
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-900">
          Q{questionNumber}. {questionText}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      </div>

      <div className="grid grid-cols-5 gap-2">
        {scales.map((scale) => (
          <button
            key={scale.value}
            type="button"
            onClick={() => onChange(scale.value)}
            className={`
              px-4 py-3 text-sm font-medium rounded-lg border-2 transition-all
              ${
                value === scale.value
                  ? 'border-blue-600 bg-blue-50 text-blue-700'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-blue-300 hover:bg-gray-50'
              }
            `}
          >
            <div className="text-center">
              <div className="text-lg font-bold mb-1">{scale.value}</div>
              <div className="text-xs leading-tight">{scale.label}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
