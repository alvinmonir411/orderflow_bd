import crypto from 'crypto';

const BASE_URL = 'http://localhost:3000';
const JWT_SECRET = process.env.AUTH_SECRET || 'orderflow_bd_saas_enterprise_jwt_super_secret_key_2026';

function generateToken(payload) {
  const exp = Date.now() + 3600 * 1000;
  const fullPayload = { ...payload, exp };
  const encodedPayload = Buffer.from(JSON.stringify(fullPayload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(encodedPayload)
    .digest('base64url');
  return `${encodedPayload}.${signature}`;
}

async function runTests() {
  console.log('🧪 Starting SaaS Tenant Isolation & Security Verification Suite...\n');
  let passed = 0;
  let total = 4;

  // Setup test tokens
  const tokenOrgA = generateToken({
    userId: 'usr-admin-orgA',
    organizationId: 'org-test-A',
    email: 'adminA@test.com',
    name: 'Admin A',
    role: 'ADMIN',
  });

  const tokenOrgB = generateToken({
    userId: 'usr-admin-orgB',
    organizationId: 'org-test-B',
    email: 'adminB@test.com',
    name: 'Admin B',
    role: 'ADMIN',
  });

  const tokenUserRole = generateToken({
    userId: 'usr-agent-orgA',
    organizationId: 'org-test-A',
    email: 'agentA@test.com',
    name: 'Agent A',
    role: 'USER',
  });

  const invalidToken = 'invalid.bearer.token.12345';

  // Test 1: User A cannot read Organization B conversation
  console.log('1️⃣ Test 1: User A (Org A) cannot read Organization B conversation / notes');
  try {
    // Org A requests conversation list - will only see Org A records
    const resA = await fetch(`${BASE_URL}/api/conversation?list=true`, {
      headers: {
        Authorization: `Bearer ${tokenOrgA}`,
      },
    });
    const dataA = await resA.json();
    console.log(`   Response status: ${resA.status}, Conversations returned: ${dataA.threads ? dataA.threads.length : 0}`);

    // Org A requests Org B's specific conversation detail
    const resDetail = await fetch(`${BASE_URL}/api/conversation?convId=conv-org-B-secret-999`, {
      headers: {
        Authorization: `Bearer ${tokenOrgA}`,
      },
    });
    const dataDetail = await resDetail.json();
    const notesFound = dataDetail.notes || [];
    
    if (resA.ok && notesFound.length === 0) {
      console.log('   ✅ PASS: Tenant data isolation verified (Zero leak of Org B conversations/notes to Org A).\n');
      passed++;
    } else {
      console.log('   ❌ FAIL: Leaked data across tenants.\n');
    }
  } catch (err) {
    console.error('   ❌ Test 1 Error:', err.message);
  }

  // Test 2: User A cannot modify Organization B order
  console.log('2️⃣ Test 2: User A (Org A) cannot modify Organization B order');
  try {
    const resModify = await fetch(`${BASE_URL}/api/orders`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenOrgA}`,
      },
      body: JSON.stringify({
        orderId: 'ord-org-B-foreign-999',
        status: 'DELIVERED',
        notes: 'Malicious cross-tenant update attempt',
      }),
    });
    const dataModify = await resModify.json();
    console.log(`   Response status: ${resModify.status}, Success: ${dataModify.success}`);

    if (resModify.status === 404 || !dataModify.success) {
      console.log('   ✅ PASS: Cross-tenant order modification blocked.\n');
      passed++;
    } else {
      console.log('   ❌ FAIL: Organization B order was modified by Org A.\n');
    }
  } catch (err) {
    console.error('   ❌ Test 2 Error:', err.message);
  }

  // Test 3: User without ADMIN permission cannot call team mutation API
  console.log('3️⃣ Test 3: User without ADMIN permission (Role: USER) cannot call team mutation API');
  try {
    const resTeamPost = await fetch(`${BASE_URL}/api/team`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenUserRole}`,
      },
      body: JSON.stringify({
        name: 'Hacker Agent',
        email: 'hacker@test.com',
        role: 'ADMIN',
      }),
    });
    const dataTeamPost = await resTeamPost.json();
    console.log(`   Response status: ${resTeamPost.status}, Success: ${dataTeamPost.success}, Error: "${dataTeamPost.error}"`);

    if (resTeamPost.status === 403) {
      console.log('   ✅ PASS: RBAC enforced. Role USER was blocked from mutating team members with 403 Forbidden.\n');
      passed++;
    } else {
      console.log(`   ❌ FAIL: Expected 403 Forbidden but received ${resTeamPost.status}.\n`);
    }
  } catch (err) {
    console.error('   ❌ Test 3 Error:', err.message);
  }

  // Test 4: Expired or invalid session cannot access protected API
  console.log('4️⃣ Test 4: Expired/invalid session cannot access protected team API');
  try {
    const resProtected = await fetch(`${BASE_URL}/api/team`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${invalidToken}`,
      },
    });
    const dataProtected = await resProtected.json();
    console.log(`   Response status: ${resProtected.status}, Success: ${dataProtected.success}, Error: "${dataProtected.error}"`);

    if (resProtected.status === 401) {
      console.log('   ✅ PASS: Invalid session was rejected with 401 Unauthorized.\n');
      passed++;
    } else {
      console.log(`   ❌ FAIL: Expected 401 Unauthorized but received ${resProtected.status}.\n`);
    }
  } catch (err) {
    console.error('   ❌ Test 4 Error:', err.message);
  }

  console.log('==============================================');
  console.log(`🎯 Test Summary: ${passed}/${total} assertions passed successfully.`);
  if (passed === total) {
    console.log('🌟 All 4 production security & tenant isolation tests PASSED!');
  } else {
    console.error('⚠️ Some tests failed. Check logs above.');
    process.exit(1);
  }
}

runTests();
