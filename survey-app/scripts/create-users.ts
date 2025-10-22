/**
 * 사용자 계정 생성 스크립트
 *
 * 사용법:
 * npm run create-users
 *
 * 또는 특정 사용자만 생성:
 * npx tsx scripts/create-users.ts <username> <password> [is_admin]
 */

import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as path from 'path';

// .env.local 파일 읽기
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
  console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createUser(username: string, password: string, isAdmin: boolean = false) {
  try {
    // 비밀번호 해시화
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // 사용자 생성
    const { data, error } = await supabase
      .from('users')
      .insert({
        username,
        password_hash: passwordHash,
        is_admin: isAdmin,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        console.error(`✗ 사용자 '${username}'는 이미 존재합니다.`);
      } else {
        console.error(`✗ 사용자 '${username}' 생성 실패:`, error.message);
      }
      return false;
    }

    console.log(`✓ 사용자 '${username}' 생성 완료 (관리자: ${isAdmin ? '예' : '아니오'})`);
    return true;
  } catch (error) {
    console.error(`✗ 사용자 '${username}' 생성 중 오류:`, error);
    return false;
  }
}

async function createDefaultUsers() {
  console.log('기본 사용자 계정 생성 중...\n');

  // 관리자 계정
  await createUser('admin', 'admin1234', true);

  // 부서별 테스트 계정 (직원)
  const departments = [
    '지역협력부',
    '계통운영부',
    '송전운영부',
    '변전운영부',
    '전자제어부',
    '토건운영부',
    '강릉전력',
    '동해전력',
    '원주전력',
    '태백전력',
  ];

  for (const dept of departments) {
    const username = `${dept}_직원`;
    await createUser(username, 'test1234', false);
  }

  // 간부 테스트 계정 (5개)
  for (let i = 1; i <= 5; i++) {
    const username = `간부${i}`;
    await createUser(username, 'test1234', false);
  }

  console.log('\n기본 사용자 계정 생성 완료!');
  console.log('\n생성된 계정:');
  console.log('- 관리자: admin / admin1234');
  console.log('- 직원: {부서명}_직원 / test1234 (10개)');
  console.log('- 간부: 간부1~간부5 / test1234 (5개)');
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    // 기본 사용자 생성
    await createDefaultUsers();
  } else if (args.length >= 2) {
    // 특정 사용자 생성
    const [username, password, isAdmin] = args;
    await createUser(username, password, isAdmin === 'true' || isAdmin === '1');
  } else {
    console.log('사용법:');
    console.log('  npx tsx scripts/create-users.ts                          # 기본 계정 생성');
    console.log('  npx tsx scripts/create-users.ts <username> <password>    # 일반 사용자 생성');
    console.log('  npx tsx scripts/create-users.ts <username> <password> 1  # 관리자 생성');
    process.exit(1);
  }
}

main();
