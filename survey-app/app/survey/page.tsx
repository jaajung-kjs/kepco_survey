import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import SurveyForm from '@/components/SurveyForm';
import SurveyCompleted from '@/components/SurveyCompleted';

export default async function SurveyPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  if (user.has_completed) {
    return <SurveyCompleted completedAt={user.completed_at!} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            전력관리처 설문조사
          </h1>
          <p className="text-gray-600 mt-2">
            안녕하세요, {user.username}님
          </p>
        </div>

        <SurveyForm />
      </div>
    </div>
  );
}
