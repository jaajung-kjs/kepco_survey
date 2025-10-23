import { supabase } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// .env.local 파일 로드
const envPath = path.resolve(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      const value = valueParts.join('=');
      if (key && value) {
        process.env[key.trim()] = value.trim();
      }
    }
  });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('환경 변수가 설정되지 않았습니다.');
  process.exit(1);
}

// Admin API 사용을 위한 Service Role Key
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function createUsers() {
  console.log('🚀 Supabase Auth 계정 생성 시작...\n');

  const users = [
    ...Array.from({ length: 10 }, (_, i) => ({
      username: `user${String(i + 1).padStart(2, '0')}`,
      password: 'pass1234',
      is_admin: false,
    })),
    {
      username: 'admin',
      password: 'admin1234',
      is_admin: true,
    },
  ];

  for (const userData of users) {
    try {
      const email = `${userData.username}@survey.local`;

      // 1. Supabase Auth 계정 생성
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        password: userData.password,
        email_confirm: true,
      });

      if (authError) {
        console.error(`❌ ${userData.username} 생성 실패:`, authError.message);
        continue;
      }

      // 2. users 테이블에 메타데이터 저장
      const { error: insertError } = await supabase.from('users').insert({
        auth_user_id: authData.user.id,
        username: userData.username,
        is_admin: userData.is_admin,
        has_completed: false,
      });

      if (insertError) {
        console.error(`❌ ${userData.username} 메타데이터 저장 실패:`, insertError.message);
        continue;
      }

      console.log(`✅ ${userData.username} - ${userData.is_admin ? '관리자' : '일반'}`);
    } catch (error) {
      console.error(`❌ ${userData.username} 오류:`, error);
    }
  }

  console.log('\n✨ 완료!');
  console.log('\n📋 로그인 정보:');
  console.log('일반: user01 ~ user10 / pass1234');
  console.log('관리자: admin / admin1234');
}

createUsers()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('오류:', error);
    process.exit(1);
  });
