'use client';

import { useState } from 'react';
import { DEPARTMENTS, POSITIONS } from '@/lib/constants';
import type { Department, Position } from '@/lib/constants';

interface Props {
  onSubmit: (department: Department, position: Position) => void;
}

export default function DepartmentPositionSelect({ onSubmit }: Props) {
  const [department, setDepartment] = useState<Department | ''>('');
  const [position, setPosition] = useState<Position | ''>('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!department) {
      setError('부서를 선택해주세요.');
      return;
    }

    if (!position) {
      setError('직급을 선택해주세요.');
      return;
    }

    onSubmit(department as Department, position as Position);
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">
        소속 및 직급 선택
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 부서 선택 */}
        <div>
          <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-2">
            소속 부서/지사
          </label>
          <select
            id="department"
            value={department}
            onChange={(e) => setDepartment(e.target.value as Department)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
          >
            <option value="">선택해주세요</option>
            {DEPARTMENTS.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>

        {/* 직급 선택 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            직급
          </label>
          <div className="space-y-2">
            <div className="flex items-center">
              <input
                id="position-employee"
                name="position"
                type="radio"
                value={POSITIONS.EMPLOYEE}
                checked={position === POSITIONS.EMPLOYEE}
                onChange={(e) => setPosition(e.target.value as Position)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <label htmlFor="position-employee" className="ml-3 block text-sm text-gray-700">
                직원
              </label>
            </div>
            <div className="flex items-center">
              <input
                id="position-executive"
                name="position"
                type="radio"
                value={POSITIONS.EXECUTIVE}
                checked={position === POSITIONS.EXECUTIVE}
                onChange={(e) => setPosition(e.target.value as Position)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <label htmlFor="position-executive" className="ml-3 block text-sm text-gray-700">
                간부
              </label>
            </div>
          </div>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <p className="text-sm font-medium text-red-800">{error}</p>
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            다음
          </button>
        </div>
      </form>
    </div>
  );
}
