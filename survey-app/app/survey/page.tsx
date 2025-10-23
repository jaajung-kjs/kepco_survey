'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import SurveyForm from '@/components/SurveyForm';
import SurveyCompleted from '@/components/SurveyCompleted';

export default function SurveyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function checkUser() {
      const { data: { user: authUser } } = await supabase.auth.getUser();

      if (!authUser) {
        router.push('/login');
        return;
      }

      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('auth_user_id', authUser.id)
        .single();

      setUser(userData);
      setLoading(false);
    }

    checkUser();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">로딩 중...</div>
      </div>
    );
  }

  if (!user) return null;

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
