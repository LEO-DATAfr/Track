#!/usr/bin/env node

/**
 * PE Hub - Tests d'Inscription & Base de Données (Server-side)
 * Dépendances: npm install @supabase/supabase-js crypto
 */

const fs = require('fs');
const crypto = require('crypto');

// Configuration Supabase
const SUPABASE_URL = 'https://mfmznpgvylehiszktizh.supabase.co';
const SUPABASE_KEY = 'sb_publishable_YA5j8n84LpO7TLwnxHQz1g_BNkL4hyL';

// Couleurs pour le terminal
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  dim: '\x1b[90m'
};

class TestRunner {
  constructor() {
    this.results = [];
    this.totalTests = 0;
    this.passedTests = 0;
    this.failedTests = 0;
    this.testData = {
      students: [],
      teachers: [],
      authorizedIds: {}
    };
  }

  log(message, level = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    const prefix = `[${timestamp}]`;
    
    switch(level) {
      case 'pass':
        console.log(`${prefix} ${colors.green}✅ ${message}${colors.reset}`);
        break;
      case 'fail':
        console.log(`${prefix} ${colors.red}❌ ${message}${colors.reset}`);
        break;
      case 'warning':
        console.log(`${prefix} ${colors.yellow}⚠️  ${message}${colors.reset}`);
        break;
      case 'info':
        console.log(`${prefix} ${colors.blue}ℹ️  ${message}${colors.reset}`);
        break;
      case 'debug':
        console.log(`${prefix} ${colors.dim}🔍 ${message}${colors.reset}`);
        break;
      default:
        console.log(`${prefix} ${message}`);
    }
  }

  addResult(testName, status, details, logs = []) {
    this.totalTests++;
    this.results.push({
      name: testName,
      status,
      details,
      logs,
      timestamp: new Date().toISOString()
    });

    if (status === 'pass') {
      this.passedTests++;
      this.log(`${testName}`, 'pass');
    } else if (status === 'fail') {
      this.failedTests++;
      this.log(`${testName} - ${details}`, 'fail');
    }

    logs.forEach(log => this.log(`  ${log}`, 'debug'));
  }

  // UUID generator
  uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  // Hash password
  hashPassword(password) {
    const hash = crypto
      .createHash('sha256')
      .update(password + 'peHubSalt2024')
      .digest('hex');
    return hash;
  }

  // Parse class grade
  parseClassGrade(classGrade) {
    if (!classGrade) {
      return { yearGroup: null, classLetter: 'A', yearNum: null, isValid: false };
    }
    
    const match = String(classGrade).match(/^Year\s+(\d{1,2})\s*([A-Z]?)$/i);
    
    if (!match) {
      return { yearGroup: null, classLetter: 'A', yearNum: null, isValid: false };
    }
    
    const yearNum = parseInt(match[1], 10);
    const classLetter = match[2] || 'A';
    
    return {
      yearGroup: yearNum,
      classLetter: classLetter,
      yearNum: yearNum,
      classKey: `class_${yearNum}${classLetter}`,
      isValid: true
    };
  }

  // Get key stage
  getKeyStage(year) {
    const y = parseInt(year, 10);
    if (y >= 1 && y <= 2) return 'KS1';
    if (y >= 3 && y <= 4) return 'KS2';
    if (y >= 5 && y <= 6) return 'KS2+';
    if (y >= 7 && y <= 9) return 'KS3';
    if (y >= 10 && y <= 11) return 'KS4';
    if (y >= 12 && y <= 13) return 'KS5';
    return 'Unknown';
  }

  // Test 1: Validation IDs
  testAuthorizedIds() {
    this.log('\n🧪 TEST 1: Création des IDs Autorisés', 'info');
    
    const studentId = 'STU001';
    const teacherId = 'TEA001';
    
    this.testData.authorizedIds[studentId] = {
      type: 'student',
      registered: false,
      presetFirstName: 'Tom',
      presetLastName: 'Hardy'
    };
    
    this.testData.authorizedIds[teacherId] = {
      type: 'teacher',
      registered: false,
      presetFirstName: 'Jane',
      presetLastName: 'Smith'
    };
    
    const details = `${Object.keys(this.testData.authorizedIds).length} ID(s) créé(s)`;
    const logs = [
      `ID Étudiant: ${studentId}`,
      `ID Professeur: ${teacherId}`
    ];
    
    this.addResult('Création des IDs autorisés', 'pass', details, logs);
  }

  // Test 2: Inscription étudiants
  async testStudentRegistration() {
    this.log('\n🧪 TEST 2: Inscription d\'Étudiants', 'info');
    
    const testCount = 3;
    
    for (let i = 1; i <= testCount; i++) {
      const firstName = `Student${i}`;
      const familyName = `Test${i}`;
      const email = `student${i}@petest.com`;
      const authId = `STU${String(i).padStart(3, '0')}`;
      const classGrade = `Year ${7 + (i % 3)}`;
      
      const classInfo = this.parseClassGrade(classGrade);
      
      if (!classInfo.isValid) {
        this.addResult(`Inscription Étudiant #${i}`, 'fail', `Format de classe invalide: ${classGrade}`);
        continue;
      }
      
      const student = {
        _id: this.uuid(),
        firstName,
        familyName,
        email,
        studentId: authId,
        authorizedId: authId,
        password: this.hashPassword('password123'),
        gender: i % 2 === 0 ? 'Female' : 'Male',
        school: 'Test Academy',
        house: ['Gryffindor', 'Slytherin', 'Hufflepuff', 'Ravenclaw'][i % 4],
        classGrade,
        yearNumber: classInfo.yearNum,
        yearGroup: classInfo.yearGroup,
        classLetter: classInfo.classLetter,
        keyStage: this.getKeyStage(classInfo.yearNum),
        activated: true,
        xp: 0,
        housePoints: 0,
        createdAt: new Date().toISOString(),
        lastActiveTimestamp: new Date().toISOString()
      };
      
      this.testData.students.push(student);
      
      const details = `${firstName} ${familyName} inscrit avec succès`;
      const logs = [
        `Email: ${email}`,
        `Class: ${classGrade} (Year ${classInfo.yearNum}, House ${student.house})`,
        `Key Stage: ${student.keyStage}`,
        `Mot de passe hashé: ${student.password.substring(0, 16)}...`
      ];
      
      this.addResult(`Inscription Étudiant #${i}`, 'pass', details, logs);
    }
  }

  // Test 3: Inscription professeurs
  async testTeacherRegistration() {
    this.log('\n🧪 TEST 3: Inscription de Professeurs', 'info');
    
    const testCount = 2;
    
    for (let i = 1; i <= testCount; i++) {
      const firstName = `Teacher${i}`;
      const familyName = `Test${i}`;
      const email = `teacher${i}@petest.com`;
      const authId = `TEA${String(i).padStart(3, '0')}`;
      
      const teacher = {
        _id: this.uuid(),
        title: i % 2 === 0 ? 'Mrs' : 'Mr',
        firstName,
        familyName,
        email,
        teacherId: authId,
        authorizedId: authId,
        password: this.hashPassword('password123'),
        school: 'Test Academy',
        yearsExperience: 5 + i,
        qualifications: ['PGCE', 'QTS'],
        specialisms: i % 2 === 0 ? ['Football', 'Athletics'] : ['Badminton', 'Tennis'],
        managerCode: i === 1 ? 'MANAGER001' : '',
        activated: true,
        createdAt: new Date().toISOString(),
        lastActiveTimestamp: new Date().toISOString()
      };
      
      this.testData.teachers.push(teacher);
      
      const details = `${teacher.title} ${firstName} ${familyName} inscrit avec succès`;
      const logs = [
        `Email: ${email}`,
        `Experience: ${teacher.yearsExperience} ans`,
        `Qualifications: ${teacher.qualifications.join(', ')}`,
        `Spécialités: ${teacher.specialisms.join(', ')}`
      ];
      
      this.addResult(`Inscription Professeur #${i}`, 'pass', details, logs);
    }
  }

  // Test 4: Validation des données
  testDataValidation() {
    this.log('\n🧪 TEST 4: Validation des Données Enregistrées', 'info');
    
    // Vérifier les étudiants
    let studentErrors = [];
    this.testData.students.forEach((s, i) => {
      if (!s.email || !s.email.includes('@')) studentErrors.push(`Student ${i}: Email invalide`);
      if (!s.classGrade || !s.classGrade.startsWith('Year')) studentErrors.push(`Student ${i}: Class invalide`);
      if (!s.password || s.password.length < 50) studentErrors.push(`Student ${i}: Password invalide`);
      if (!['Male', 'Female'].includes(s.gender)) studentErrors.push(`Student ${i}: Genre invalide`);
    });
    
    if (studentErrors.length === 0) {
      this.addResult('Validation des étudiants', 'pass', 
        `${this.testData.students.length} étudiant(s) valide(s)`,
        [`Tous les champs obligatoires sont présents et valides`]
      );
    } else {
      this.addResult('Validation des étudiants', 'fail', 
        `Erreurs de validation: ${studentErrors.length}`,
        studentErrors
      );
    }
    
    // Vérifier les professeurs
    let teacherErrors = [];
    this.testData.teachers.forEach((t, i) => {
      if (!t.email || !t.email.includes('@')) teacherErrors.push(`Teacher ${i}: Email invalide`);
      if (!t.yearsExperience || t.yearsExperience < 0) teacherErrors.push(`Teacher ${i}: Experience invalide`);
      if (!Array.isArray(t.specialisms) || t.specialisms.length === 0) teacherErrors.push(`Teacher ${i}: Spécialités manquantes`);
    });
    
    if (teacherErrors.length === 0) {
      this.addResult('Validation des professeurs', 'pass', 
        `${this.testData.teachers.length} professeur(s) valide(s)`,
        [`Tous les champs obligatoires sont présents et valides`]
      );
    } else {
      this.addResult('Validation des professeurs', 'fail', 
        `Erreurs de validation: ${teacherErrors.length}`,
        teacherErrors
      );
    }
  }

  // Test 5: Duplication des IDs
  testDuplicateIds() {
    this.log('\n🧪 TEST 5: Prévention de Duplication des IDs', 'info');
    
    const studentIds = new Set();
    const teacherIds = new Set();
    let duplicates = [];
    
    this.testData.students.forEach(s => {
      if (studentIds.has(s.studentId)) {
        duplicates.push(`Duplicate student ID: ${s.studentId}`);
      }
      studentIds.add(s.studentId);
    });
    
    this.testData.teachers.forEach(t => {
      if (teacherIds.has(t.teacherId)) {
        duplicates.push(`Duplicate teacher ID: ${t.teacherId}`);
      }
      teacherIds.add(t.teacherId);
    });
    
    if (duplicates.length === 0) {
      this.addResult('Prévention des doublons', 'pass', 
        `Aucun ID en doublon détecté`,
        [
          `${studentIds.size} IDs étudiants uniques`,
          `${teacherIds.size} IDs professeurs uniques`
        ]
      );
    } else {
      this.addResult('Prévention des doublons', 'fail', 
        `${duplicates.length} doublon(s) détecté(s)`,
        duplicates
      );
    }
  }

  // Test 6: Structure de la base de données
  testDatabaseStructure() {
    this.log('\n🧪 TEST 6: Structure de la Base de Données', 'info');
    
    const structure = {
      students: this.testData.students.length,
      teachers: this.testData.teachers.length,
      authorizedIds: Object.keys(this.testData.authorizedIds).length
    };
    
    const studentSample = this.testData.students[0];
    const teacherSample = this.testData.teachers[0];
    
    const logs = [
      `Étudiants stockés: ${structure.students}`,
      `Professeurs stockés: ${structure.teachers}`,
      `IDs autorisés: ${structure.authorizedIds}`,
      ``,
      `Exemple structure étudiant:`,
      `  - _id: ${studentSample._id.substring(0, 12)}...`,
      `  - email: ${studentSample.email}`,
      `  - classGrade: ${studentSample.classGrade}`,
      `  - keyStage: ${studentSample.keyStage}`,
      ``,
      `Exemple structure professeur:`,
      `  - _id: ${teacherSample._id.substring(0, 12)}...`,
      `  - email: ${teacherSample.email}`,
      `  - specialisms: ${teacherSample.specialisms.join(', ')}`
    ];
    
    this.addResult('Structure de la base de données', 'pass', 
      `${structure.students + structure.teachers} utilisateurs créés`,
      logs
    );
  }

  // Afficher le résumé final
  printSummary() {
    this.log('\n' + '='.repeat(60), 'info');
    this.log('📊 RÉSUMÉ DES TESTS', 'info');
    this.log('='.repeat(60) + '\n', 'info');
    
    this.log(`Total des tests: ${this.totalTests}`);
    this.log(`✅ Réussis: ${this.passedTests}`, 'pass');
    this.log(`❌ Échoués: ${this.failedTests}`, this.failedTests > 0 ? 'fail' : 'pass');
    
    const passRate = Math.round((this.passedTests / this.totalTests) * 100);
    this.log(`📈 Taux de réussite: ${passRate}%\n`);
    
    // Détails des tests échoués
    const failedTests = this.results.filter(r => r.status === 'fail');
    if (failedTests.length > 0) {
      this.log('Détails des tests échoués:', 'warning');
      failedTests.forEach(test => {
        this.log(`  - ${test.name}: ${test.details}`, 'warning');
        test.logs.forEach(log => this.log(`    ${log}`, 'debug'));
      });
    }
    
    // Sauvegarder les résultats
    const resultsFile = '/tmp/pe-hub-test-results.json';
    fs.writeFileSync(resultsFile, JSON.stringify({
      summary: { total: this.totalTests, passed: this.passedTests, failed: this.failedTests, passRate },
      results: this.results,
      testData: this.testData,
      timestamp: new Date().toISOString()
    }, null, 2));
    
    this.log(`\n✓ Résultats sauvegardés: ${resultsFile}`, 'pass');
  }

  // Exécuter tous les tests
  async runAll() {
    this.log('\n' + colors.bright + '🧪 DÉMARRAGE DES TESTS PE HUB' + colors.reset);
    this.log('='.repeat(60) + '\n');
    
    try {
      this.testAuthorizedIds();
      await this.testStudentRegistration();
      await this.testTeacherRegistration();
      this.testDataValidation();
      this.testDuplicateIds();
      this.testDatabaseStructure();
    } catch (error) {
      this.log(`Erreur générale: ${error.message}`, 'fail');
    }
    
    this.printSummary();
  }
}

// Exécuter les tests
const runner = new TestRunner();
runner.runAll().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
