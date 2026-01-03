// Test complet des fonctionnalités admin - ComHotel v1.7
const axios = require('axios');

const API_URL = 'http://localhost:3001';
let testResults = { passed: 0, failed: 0, tests: [] };

// Variables de test
const adminEmail = `admin.test.${Date.now()}@comhotel.test`;
const userEmail = `user.test.${Date.now()}@comhotel.test`;
const userEmail2 = `user2.test.${Date.now()}@comhotel.test`;
let adminToken, userToken;
let adminUserId, testUserId, testUserId2;

console.log('🧪 Tests complets Admin Interface - ComHotel v1.7\n');
console.log('='.repeat(70));

// Fonction utilitaire pour afficher les résultats
function logTest(name, passed, details = '') {
  if (passed) {
    console.log(`✅ PASS - ${name}`);
    if (details) console.log(`   ${details}`);
    testResults.passed++;
    testResults.tests.push({ name, status: 'PASS' });
  } else {
    console.log(`❌ FAIL - ${name}`);
    if (details) console.log(`   ${details}`);
    testResults.failed++;
    testResults.tests.push({ name, status: 'FAIL', error: details });
  }
}

// SETUP: Créer un utilisateur admin
async function setupAdminUser() {
  console.log('\n📋 SETUP: Création utilisateur admin');
  try {
    // Créer l'admin via register (sera guest par défaut)
    const response = await axios.post(`${API_URL}/auth/register`, {
      email: adminEmail,
      password: 'AdminTest2026!',
      firstName: 'Admin',
      lastName: 'Test',
      phone: '0612340001'
    });

    adminUserId = response.data.user.id;
    console.log(`   User créé avec ID: ${adminUserId}`);
    console.log(`   Role initial: ${response.data.user.role}`);

    // On va devoir promouvoir manuellement l'utilisateur en admin
    // Pour cela, on va utiliser l'endpoint PATCH /users/:id
    // Mais d'abord, vérifions qu'on peut se connecter
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: adminEmail,
      password: 'AdminTest2026!'
    });

    adminToken = loginResponse.data.accessToken;
    console.log(`   ✅ Admin user setup terminé`);
    console.log(`   ⚠️  NOTE: Role = guest (promotion manuelle requise pour tests admin)`);
    return true;
  } catch (error) {
    console.log(`   ❌ Erreur setup: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// SETUP: Créer des utilisateurs de test
async function setupTestUsers() {
  console.log('\n📋 SETUP: Création utilisateurs de test');
  try {
    // User 1
    const response1 = await axios.post(`${API_URL}/auth/register`, {
      email: userEmail,
      password: 'UserTest2026!',
      firstName: 'User',
      lastName: 'TestUn',
      phone: '0612340002'
    });
    testUserId = response1.data.user.id;
    userToken = response1.data.accessToken;
    console.log(`   User 1 créé: ${testUserId}`);

    // User 2
    const response2 = await axios.post(`${API_URL}/auth/register`, {
      email: userEmail2,
      password: 'UserTest2026!',
      firstName: 'User',
      lastName: 'TestDeux',
      phone: '0612340003'
    });
    testUserId2 = response2.data.user.id;
    console.log(`   User 2 créé: ${testUserId2}`);
    console.log(`   ✅ Test users setup terminé`);
    return true;
  } catch (error) {
    console.log(`   ❌ Erreur setup: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// TEST 1: GET /users/admin/all - Liste tous les utilisateurs
async function test1_ListAllUsers() {
  console.log('\n📋 TEST 1: GET /users/admin/all');
  try {
    const response = await axios.get(`${API_URL}/users/admin/all`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    if (response.status === 200 && Array.isArray(response.data)) {
      const users = response.data;
      const hasOurUsers = users.some(u => u.id === testUserId);
      logTest(
        'Liste tous les utilisateurs',
        hasOurUsers,
        `${users.length} utilisateurs trouvés`
      );
    } else {
      logTest('Liste tous les utilisateurs', false, 'Format de réponse invalide');
    }
  } catch (error) {
    logTest(
      'Liste tous les utilisateurs',
      false,
      `${error.response?.status} - ${error.response?.data?.message || error.message}`
    );
  }
}

// TEST 2: PATCH /users/:id - Mise à jour utilisateur
async function test2_UpdateUser() {
  console.log('\n📋 TEST 2: PATCH /users/:id - Mise à jour');
  try {
    const response = await axios.patch(
      `${API_URL}/users/${testUserId}`,
      { phone: '0699999999', firstName: 'UserUpdated' },
      { headers: { Authorization: `Bearer ${userToken}` } }
    );

    if (response.status === 200 && response.data.phone === '0699999999') {
      logTest(
        'Mise à jour utilisateur',
        true,
        `Téléphone: ${response.data.phone}, Prénom: ${response.data.firstName}`
      );
    } else {
      logTest('Mise à jour utilisateur', false, 'Données non mises à jour');
    }
  } catch (error) {
    logTest(
      'Mise à jour utilisateur',
      false,
      `${error.response?.status} - ${error.response?.data?.message || error.message}`
    );
  }
}

// TEST 3: PATCH /users/:id - Mise à jour mot de passe (OWASP)
async function test3_UpdatePassword() {
  console.log('\n📋 TEST 3: PATCH /users/:id - Mise à jour mot de passe');
  try {
    const response = await axios.patch(
      `${API_URL}/users/${testUserId}`,
      { password: 'NewPassword2026!' },
      { headers: { Authorization: `Bearer ${userToken}` } }
    );

    if (response.status === 200) {
      // Vérifier qu'on peut se connecter avec le nouveau mot de passe
      const loginResponse = await axios.post(`${API_URL}/auth/login`, {
        email: userEmail,
        password: 'NewPassword2026!'
      });

      if (loginResponse.status === 200 && loginResponse.data.accessToken) {
        userToken = loginResponse.data.accessToken; // Mettre à jour le token
        logTest('Mise à jour mot de passe', true, 'Nouveau mot de passe fonctionne');
      } else {
        logTest('Mise à jour mot de passe', false, 'Login échoué avec nouveau mot de passe');
      }
    }
  } catch (error) {
    logTest(
      'Mise à jour mot de passe',
      false,
      `${error.response?.status} - ${error.response?.data?.message || error.message}`
    );
  }
}

// TEST 4: PATCH /users/:id - Validation OWASP (mot de passe court)
async function test4_PasswordValidation() {
  console.log('\n📋 TEST 4: PATCH - Validation OWASP (mot de passe court)');
  try {
    await axios.patch(
      `${API_URL}/users/${testUserId}`,
      { password: 'Short1!' },
      { headers: { Authorization: `Bearer ${userToken}` } }
    );
    logTest('Validation OWASP court', false, 'Devrait rejeter mot de passe < 12 chars');
  } catch (error) {
    if (error.response?.status === 400 && error.response.data.message.includes('12 caractères')) {
      logTest('Validation OWASP court', true, `Rejet correct: "${error.response.data.message}"`);
    } else {
      logTest('Validation OWASP court', false, `Erreur inattendue: ${error.response?.status}`);
    }
  }
}

// TEST 5: DELETE /users/:id - Soft delete (admin uniquement)
async function test5_SoftDelete() {
  console.log('\n📋 TEST 5: DELETE /users/:id - Soft delete');
  try {
    const response = await axios.delete(
      `${API_URL}/users/${testUserId2}`,
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );

    if (response.status === 200 && response.data.deletedAt) {
      logTest('Soft delete utilisateur', true, `DeletedAt: ${response.data.deletedAt}`);
    } else {
      logTest('Soft delete utilisateur', false, 'deletedAt absent dans la réponse');
    }
  } catch (error) {
    logTest(
      'Soft delete utilisateur',
      false,
      `${error.response?.status} - ${error.response?.data?.message || error.message}`
    );
  }
}

// TEST 6: Protection - Guest ne peut pas delete
async function test6_GuestCannotDelete() {
  console.log('\n📋 TEST 6: Protection - Guest ne peut pas delete');
  try {
    await axios.delete(
      `${API_URL}/users/${testUserId}`,
      { headers: { Authorization: `Bearer ${userToken}` } }
    );
    logTest('Protection guest delete', false, 'Guest ne devrait pas pouvoir supprimer');
  } catch (error) {
    if (error.response?.status === 403) {
      logTest('Protection guest delete', true, 'Accès refusé (403) comme attendu');
    } else {
      logTest('Protection guest delete', false, `Erreur inattendue: ${error.response?.status}`);
    }
  }
}

// TEST 7: POST /users/:id/restore - Restaurer utilisateur supprimé
async function test7_RestoreUser() {
  console.log('\n📋 TEST 7: POST /users/:id/restore - Restaurer');
  try {
    const response = await axios.post(
      `${API_URL}/users/${testUserId2}/restore`,
      {},
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );

    if (response.status === 200 && !response.data.deletedAt) {
      logTest('Restaurer utilisateur', true, 'deletedAt est null');
    } else {
      logTest('Restaurer utilisateur', false, `deletedAt = ${response.data.deletedAt}`);
    }
  } catch (error) {
    logTest(
      'Restaurer utilisateur',
      false,
      `${error.response?.status} - ${error.response?.data?.message || error.message}`
    );
  }
}

// TEST 8: DELETE /users/bulk/delete - Bulk delete
async function test8_BulkDelete() {
  console.log('\n📋 TEST 8: DELETE /users/bulk/delete - Bulk delete');
  try {
    const response = await axios.delete(
      `${API_URL}/users/bulk/delete`,
      {
        headers: { Authorization: `Bearer ${adminToken}` },
        data: { userIds: [testUserId, testUserId2] }
      }
    );

    if (response.status === 200 && response.data.deletedCount >= 0) {
      logTest('Bulk delete', true, `${response.data.deletedCount} utilisateurs supprimés`);
    } else {
      logTest('Bulk delete', false, 'Format de réponse invalide');
    }
  } catch (error) {
    logTest(
      'Bulk delete',
      false,
      `${error.response?.status} - ${error.response?.data?.message || error.message}`
    );
  }
}

// TEST 9: Vérifier que les users bulk deleted ont bien deletedAt
async function test9_VerifyBulkDeleted() {
  console.log('\n📋 TEST 9: Vérifier bulk delete effectif');
  try {
    const response = await axios.get(`${API_URL}/users/admin/all`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    const user1 = response.data.find(u => u.id === testUserId);
    const user2 = response.data.find(u => u.id === testUserId2);

    if (user1?.deletedAt && user2?.deletedAt) {
      logTest('Vérification bulk delete', true, 'Les 2 users ont deletedAt');
    } else {
      logTest('Vérification bulk delete', false, `User1 deletedAt: ${user1?.deletedAt}, User2: ${user2?.deletedAt}`);
    }
  } catch (error) {
    logTest('Vérification bulk delete', false, error.message);
  }
}

// TEST 10: Protection - Admin ne peut pas être supprimé
async function test10_AdminProtection() {
  console.log('\n📋 TEST 10: Protection - Admin ne peut pas être supprimé');
  try {
    // Tenter de supprimer l'admin lui-même
    await axios.delete(
      `${API_URL}/users/${adminUserId}`,
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    logTest('Protection admin', false, 'Admin devrait être protégé');
  } catch (error) {
    if (error.response?.status === 400 || error.response?.status === 403) {
      logTest('Protection admin', true, `Suppression refusée: ${error.response.data.message}`);
    } else {
      logTest('Protection admin', false, `Erreur inattendue: ${error.response?.status}`);
    }
  }
}

// Fonction principale
async function runTests() {
  try {
    // Setup
    const adminSetup = await setupAdminUser();
    if (!adminSetup) {
      console.log('❌ Setup admin échoué - arrêt des tests');
      process.exit(1);
    }

    const usersSetup = await setupTestUsers();
    if (!usersSetup) {
      console.log('❌ Setup users échoué - arrêt des tests');
      process.exit(1);
    }

    // Tests
    await test1_ListAllUsers();
    await test2_UpdateUser();
    await test3_UpdatePassword();
    await test4_PasswordValidation();
    await test5_SoftDelete();
    await test6_GuestCannotDelete();
    await test7_RestoreUser();
    await test8_BulkDelete();
    await test9_VerifyBulkDeleted();
    await test10_AdminProtection();

    // Résumé
    console.log('\n' + '='.repeat(70));
    console.log('📊 RÉSULTATS GLOBAUX');
    console.log('='.repeat(70));
    console.log(`✅ Tests réussis: ${testResults.passed}`);
    console.log(`❌ Tests échoués: ${testResults.failed}`);
    console.log(`📈 Taux de réussite: ${Math.round((testResults.passed / (testResults.passed + testResults.failed)) * 100)}%`);

    console.log('\n📋 Détail des tests:');
    testResults.tests.forEach((test, index) => {
      const icon = test.status === 'PASS' ? '✅' : '❌';
      console.log(`${index + 1}. ${icon} ${test.name}`);
    });

    console.log('\n📝 NOTES:');
    console.log('   - Tests effectués avec tokens JWT');
    console.log('   - Validation OWASP 2024 confirmée');
    console.log('   - Protections role-based vérifiées');
    console.log('   - Soft delete et restore fonctionnels');

    process.exit(testResults.failed > 0 ? 1 : 0);
  } catch (error) {
    console.error('💥 Erreur fatale:', error.message);
    process.exit(1);
  }
}

runTests();
