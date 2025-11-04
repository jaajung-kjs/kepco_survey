import { createClient } from '@supabase/supabase-js';
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

  const userIds = [
    'abc39485', 'kzt02841', 'rnm58320', 'tuvw5500', 'xyzq6213', 'erty1256',
    'qwe94752', 'lop12948', 'tgh50392', 'jkjh8521', 'dbaz4563', 'nmki7892',
    'bvn48201', 'msd94753', 'yui20495', 'wzas7899', 'srqp5623', 'wsdf8596',
    'cxz58401', 'pql94721', 'jkl32058', 'feca7412', 'jkum4566', 'xdrt4289',
    'fgh12940', 'dse75029', 'nmb59320', 'qwsd1256', 'xcvb7523', 'sert9621',
    'qaz18405', 'wer94820', 'tyu30591', 'bhui4561', 'cfgy7412', 'cdrt8536',
    'iop57203', 'asd49302', 'zxc58204', 'uiop1235', 'tyuh8569', 'cfuo1256',
    'vbn10395', 'hjk58420', 'mnb94720', 'yuhn1569', 'zxcf5689', 'wefh1259',
    'lkj39205', 'poi58201', 'ghj30492', 'ghyu7489', 'ghui6359', 'xcgy2596',
    'tre59201', 'plm38405', 'uio58392', 'jire1256', 'jkop1587', 'ntip7852',
    'bnm10394', 'wsx58304', 'rfv30491', 'xdf49201', 'edc59402', 'tgb29405'
  ];

  const password = 'pass5792';
  let successCount = 0;
  let failCount = 0;

  for (const username of userIds) {
    try {
      const email = `${username}@survey.local`;

      // 1. Supabase Auth 계정 생성
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

      if (authError) {
        console.error(`❌ ${username} 생성 실패:`, authError.message);
        failCount++;
        continue;
      }

      // 2. users 테이블에 메타데이터 저장
      const { error: insertError } = await supabase.from('users').insert({
        auth_user_id: authData.user.id,
        username: username,
        is_admin: false,
        has_completed: false,
      });

      if (insertError) {
        console.error(`❌ ${username} 메타데이터 저장 실패:`, insertError.message);
        failCount++;
        continue;
      }

      console.log(`✅ ${username}`);
      successCount++;
    } catch (error) {
      console.error(`❌ ${username} 오류:`, error);
      failCount++;
    }
  }

  console.log('\n✨ 완료!');
  console.log(`\n📊 결과: 성공 ${successCount}개, 실패 ${failCount}개`);
  console.log('\n📋 로그인 정보:');
  console.log(`모든 계정 비밀번호: ${password}`);
}

createUsers()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('오류:', error);
    process.exit(1);
  });
