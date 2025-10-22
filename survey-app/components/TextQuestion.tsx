interface Props {
  questionNumber: number;
  questionText: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
  minLength?: number;
}

export default function TextQuestion({
  questionNumber,
  questionText,
  value,
  onChange,
  required = false,
  placeholder = '의견을 자유롭게 작성해주세요 (최소 10자 이상)',
  minLength = 10,
}: Props) {
  const charCount = value.length;
  const isValid = !required || charCount >= minLength;

  return (
    <div className="border-b border-gray-200 pb-3 mb-3">
      <div className="mb-2">
        <label className="block text-base font-medium text-gray-900">
          Q{questionNumber}. {questionText}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      </div>

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className={`w-full px-3 py-2 text-sm border-2 rounded focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all ${
          required && charCount > 0 && !isValid
            ? 'border-red-500 focus:border-red-600'
            : 'border-gray-300 focus:border-blue-600'
        }`}
      />

      {required && (
        <div className="mt-1 text-xs">
          <span className={charCount >= minLength ? 'text-green-600' : 'text-gray-500'}>
            {charCount}자 / 최소 {minLength}자
          </span>
        </div>
      )}
    </div>
  );
}
