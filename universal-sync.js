/**
 * PE Hub - Universal Sync Module for ALL Data Operations
 * 
 * This module intercepts ALL data modifications from students and teachers
 * and automatically syncs them to Supabase in real-time
 * 
 * Works transparently with existing sdkSave() calls
 */

class UniversalSupabaseSync {
  constructor(supabaseClient) {
    this.supabase = supabaseClient;
    this.isOnline = navigator.onLine;
    this.syncQueue = [];
    this.isSyncing = false;
    this.originalSdkSave = null;
    this.syncInterval = null;
    
    // Initialize connection listeners
    window.addEventListener('online', () => this.handleOnline());
    window.addEventListener('offline', () => this.handleOffline());
    
    // Periodic sync attempt (every 5 seconds if offline data exists)
    this.syncInterval = setInterval(() => {
      if (this.isOnline && this.syncQueue.length > 0) {
        this.syncQueuedData();
      }
    }, 5000);
    
    console.log('[UniversalSync] ✅ Initialized - Ready to sync all operations');
  }

  /* ====================================
     CONNECTION STATUS
     ==================================== */
  
  handleOnline() {
    console.log('[UniversalSync] 🔴 → 🟢 Online detected, syncing queued operations...');
    this.isOnline = true;
    this.syncQueuedData();
  }

  handleOffline() {
    console.log('[UniversalSync] 🟢 → 🔴 Offline detected, queuing mode enabled');
    this.isOnline = false;
  }

  /* ====================================
     INTERCEPTOR - sdkSave Wrapper
     ==================================== */
  
  wrapSdkSave(originalSdkSave) {
    this.originalSdkSave = originalSdkSave;
    
    return (collection, id, data) => {
      // 1. Save to localStorage first (original behavior)
      const result = originalSdkSave.call(window, collection, id, data);
      
      // 2. Queue for Supabase sync
      this.queueOperation(collection, id, data);
      
      return result;
    };
  }

  /* ====================================
     QUEUE OPERATION
     ==================================== */
  
  queueOperation(collection, id, data) {
    const operation = {
      type: 'save',
      collection: collection,
      id: id,
      data: { ...data },
      timestamp: Date.now(),
      userType: this.detectUserType(collection)
    };
    
    this.syncQueue.push(operation);
    
    // Try to sync immediately if online
    if (this.isOnline) {
      this.syncToSupabase(operation);
    } else {
      console.log(`[UniversalSync] ⏸️  Queued: ${collection}/${id} (${this.syncQueue.length} items)`);
    }
  }

  /* ====================================
     DETECT USER TYPE FROM COLLECTION
     ==================================== */
  
  detectUserType(collection) {
    if (collection.includes('student') || collection === 'students' || collection === 'quizProgress') {
      return 'student';
    } else if (collection.includes('teacher') || collection === 'teachers' || collection === 'assessments') {
      return 'teacher';
    }
    return 'system';
  }

  /* ====================================
     SYNC TO SUPABASE
     ==================================== */
  
  async syncToSupabase(operation) {
    if (!this.isOnline) return;
    
    try {
      const { collection, id, data } = operation;
      
      // Map collections to Supabase tables
      switch (collection) {
        // ===== STUDENT DATA =====
        case 'students':
          await this.syncStudentData(id, data);
          break;
        case 'quizProgress':
          await this.syncQuizProgress(id, data);
          break;
        case 'studentAchievements':
          await this.syncStudentAchievements(id, data);
          break;
          
        // ===== TEACHER DATA =====
        case 'teachers':
          await this.syncTeacherData(id, data);
          break;
        case 'assessments':
          await this.syncAssessment(id, data);
          break;
        case 'housePointEvents':
          await this.syncHousePointEvent(id, data);
          break;
        case 'teacherNotifications':
          await this.syncTeacherNotification(id, data);
          break;
          
        // ===== GENERAL DATA =====
        case 'authorizedIds':
          await this.syncAuthorizedId(id, data);
          break;
        case 'seasonHistory':
          await this.syncSeasonHistory(id, data);
          break;
          
        default:
          console.log(`[UniversalSync] ℹ️  No sync rule for collection: ${collection}`);
      }
      
      // Remove from queue
      this.removeFromQueue(operation);
      
    } catch (err) {
      if (err?.code === 'PGRST205' && err.message?.includes('Could not find the table')) {
        console.error(`[UniversalSync] ❌ Fatal schema error: ${err.message}`);
        console.error('[UniversalSync] 🔧 Supabase table missing for this collection. Create the missing tables in Supabase using supabase-schema.sql, then refresh the app.');
      } else {
        console.error(`[UniversalSync] ❌ Sync error:`, err);
      }
      // Keep in queue for retry once the schema is fixed
    }
  }

  /* ====================================
     STUDENT SYNC OPERATIONS
     ==================================== */
  
  async syncStudentData(studentId, studentData) {
    console.log(`[UniversalSync] 👤 Syncing student: ${studentId}`);
    
    // CORE COLUMNS ONLY - These definitely exist in the original schema
    const payload = {
      id: studentId,
      first_name: studentData.firstName,
      last_name: studentData.familyName,
      email: studentData.email,
      gender: studentData.gender || null,
      class_grade: studentData.classGrade || null,
      house: studentData.house || null,
      school: studentData.school || null,
      xp: studentData.xp || 0,
      house_points: studentData.housePoints || 0,
      activated: studentData.activated || false,
      onboarding_complete: studentData.onboardingComplete || false,
      updated_at: new Date().toISOString()
    };
    
    console.log(`[UniversalSync] 📤 Student payload (core columns):`, payload);
    
    try {
      // Upsert core columns
      const { data, error } = await this.supabase
        .from('students')
        .upsert([payload]);

      if (error) {
        console.warn(`[UniversalSync] ⚠️  Upsert failed, retrying with update...`);
        
        // Fallback: update
        const { data: updateData, error: updateError } = await this.supabase
          .from('students')
          .update(payload)
          .eq('id', studentId);
        
        if (updateError) {
          console.warn(`[UniversalSync] ⚠️  Update failed, trying insert...`);
          const { data: insertData, error: insertError } = await this.supabase
            .from('students')
            .insert([payload]);
          
          if (insertError) {
            console.error(`[UniversalSync] ❌ Sync failed (all 3 methods):`, insertError);
            throw insertError;
          }
          console.log(`[UniversalSync] ✅ Student synced (INSERT)`);
          return insertData;
        }
        console.log(`[UniversalSync] ✅ Student synced (UPDATE)`);
        return updateData;
      }
      
      console.log(`[UniversalSync] ✅ Student synced (UPSERT):`, data);
      return data;
    } catch (err) {
      console.error(`[UniversalSync] ❌ Student sync error:`, err);
      throw err;
    }
  }

  async syncQuizProgress(quizId, quizData) {
    console.log(`[UniversalSync] 📚 Syncing quiz progress: ${quizId}`);
    
    const payload = {
      id: quizId,
      student_id: quizData.studentId,
      quiz_key: quizData.quizKey,
      score: quizData.score,
      completed_at: quizData.completedAt,
      updated_at: new Date().toISOString()
    };
    
    try {
      const { data, error } = await this.supabase
        .from('quiz_progress')
        .upsert([payload]);

      if (error) {
        const { data: updateData, error: updateError } = await this.supabase
          .from('quiz_progress')
          .update(payload)
          .eq('id', quizId);
        
        if (updateError) {
          const { data: insertData, error: insertError } = await this.supabase
            .from('quiz_progress')
            .insert([payload]);
          if (insertError) throw insertError;
          return insertData;
        }
        return updateData;
      }
      console.log(`[UniversalSync] ✅ Quiz progress synced`);
      return data;
    } catch (err) {
      console.error(`[UniversalSync] ❌ Quiz sync error:`, err);
      throw err;
    }
  }

  async syncStudentAchievements(achievementId, achievementData) {
    console.log(`[UniversalSync] 🏆 Syncing achievement: ${achievementId}`);
    
    const payload = {
      id: achievementId,
      student_id: achievementData.studentId,
      achievement_key: achievementData.key,
      earned_at: achievementData.earnedAt,
      updated_at: new Date().toISOString()
    };
    
    try {
      const { data, error } = await this.supabase
        .from('student_achievements')
        .upsert([payload]);

      if (error) {
        const { data: updateData, error: updateError } = await this.supabase
          .from('student_achievements')
          .update(payload)
          .eq('id', achievementId);
        
        if (updateError) {
          const { data: insertData, error: insertError } = await this.supabase
            .from('student_achievements')
            .insert([payload]);
          if (insertError) throw insertError;
          return insertData;
        }
        return updateData;
      }
      console.log(`[UniversalSync] ✅ Achievement synced`);
      return data;
    } catch (err) {
      console.error(`[UniversalSync] ❌ Achievement sync error:`, err);
      throw err;
    }
  }

  /* ====================================
     TEACHER SYNC OPERATIONS
     ==================================== */
  
  async syncTeacherData(teacherId, teacherData) {
    console.log(`[UniversalSync] 👨‍🏫 Syncing teacher: ${teacherId}`);
    
    const payload = {
      id: teacherId,
      first_name: teacherData.firstName,
      last_name: teacherData.familyName,
      email: teacherData.email,
      title: teacherData.title,
      school: teacherData.school,
      qualifications: JSON.stringify(teacherData.qualifications || []),
      years_experience: teacherData.yearsExperience,
      specialisms: JSON.stringify(teacherData.specialisms || []),
      updated_at: new Date().toISOString()
    };
    
    try {
      const { data, error } = await this.supabase
        .from('teachers')
        .upsert([payload]);

      if (error) {
        const { data: updateData, error: updateError } = await this.supabase
          .from('teachers')
          .update(payload)
          .eq('id', teacherId);
        
        if (updateError) {
          const { data: insertData, error: insertError } = await this.supabase
            .from('teachers')
            .insert([payload]);
          if (insertError) throw insertError;
          return insertData;
        }
        return updateData;
      }
      console.log(`[UniversalSync] ✅ Teacher synced`);
      return data;
    } catch (err) {
      console.error(`[UniversalSync] ❌ Teacher sync error:`, err);
      throw err;
    }
  }

  async syncAssessment(assessmentId, assessmentData) {
    console.log(`[UniversalSync] 📊 Syncing assessment: ${assessmentId}`);
    
    const payload = {
      id: assessmentId,
      student_id: assessmentData.studentId,
      sport_key: assessmentData.sportKey,
      source: assessmentData.source,
      skills: JSON.stringify(assessmentData.skills || []),
      teacher_comment: assessmentData.teacherComment,
      total_points: assessmentData.totalPoints,
      created_at: assessmentData.createdAt,
      updated_at: new Date().toISOString()
    };
    
    try {
      const { data, error } = await this.supabase
        .from('assessments')
        .upsert([payload]);

      if (error) {
        const { data: updateData, error: updateError } = await this.supabase
          .from('assessments')
          .update(payload)
          .eq('id', assessmentId);
        
        if (updateError) {
          const { data: insertData, error: insertError } = await this.supabase
            .from('assessments')
            .insert([payload]);
          if (insertError) throw insertError;
          return insertData;
        }
        return updateData;
      }
      console.log(`[UniversalSync] ✅ Assessment synced`);
      return data;
    } catch (err) {
      console.error(`[UniversalSync] ❌ Assessment sync error:`, err);
      throw err;
    }
  }

  async syncHousePointEvent(eventId, eventData) {
    console.log(`[UniversalSync] 🏆 Syncing house points: ${eventId}`);
    
    const { data, error } = await this.supabase
      .from('house_point_events')
      .insert([{
        student_id: eventData.studentId,
        points: eventData.points,
        source: eventData.source,
        note: eventData.note,
        created_at: eventData.date || new Date().toISOString(),
        synced_at: new Date().toISOString()
      }]);

    if (error) throw error;
    console.log(`[UniversalSync] ✅ House points synced`);
    return data;
  }

  async syncTeacherNotification(notificationId, notificationData) {
    console.log(`[UniversalSync] 🔔 Syncing notification: ${notificationId}`);
    
    const payload = {
      id: notificationId,
      teacher_id: notificationData.teacherId,
      student_id: notificationData.studentId,
      message: notificationData.message,
      read: notificationData.read,
      created_at: notificationData.createdAt,
      updated_at: new Date().toISOString()
    };
    
    try {
      const { data, error } = await this.supabase
        .from('teacher_notifications')
        .upsert([payload]);

      if (error) {
        const { data: updateData, error: updateError } = await this.supabase
          .from('teacher_notifications')
          .update(payload)
          .eq('id', notificationId);
        
        if (updateError) {
          const { data: insertData, error: insertError } = await this.supabase
            .from('teacher_notifications')
            .insert([payload]);
          if (insertError) throw insertError;
          return insertData;
        }
        return updateData;
      }
      console.log(`[UniversalSync] ✅ Notification synced`);
      return data;
    } catch (err) {
      console.error(`[UniversalSync] ❌ Notification sync error:`, err);
      throw err;
    }
  }

  /* ====================================
     SYSTEM DATA SYNC
     ==================================== */
  
  async syncAuthorizedId(idValue, idData) {
    console.log(`[UniversalSync] 🔑 Syncing authorized ID: ${idValue}`);
    
    const payload = {
      id: idValue,
      type: idData.type,
      registered: idData.registered,
      preset_first_name: idData.presetFirstName,
      preset_last_name: idData.presetLastName,
      linked_student_id: idData.linkedStudentId,
      updated_at: new Date().toISOString()
    };
    
    try {
      const { data, error } = await this.supabase
        .from('authorized_ids')
        .upsert([payload]);

      if (error) {
        const { data: updateData, error: updateError } = await this.supabase
          .from('authorized_ids')
          .update(payload)
          .eq('id', idValue);
        
        if (updateError) {
          const { data: insertData, error: insertError } = await this.supabase
            .from('authorized_ids')
            .insert([payload]);
          if (insertError) throw insertError;
          return insertData;
        }
        return updateData;
      }
      console.log(`[UniversalSync] ✅ Authorized ID synced`);
      return data;
    } catch (err) {
      console.error(`[UniversalSync] ❌ Authorized ID sync error:`, err);
      throw err;
    }
  }

  async syncSeasonHistory(seasonId, seasonData) {
    console.log(`[UniversalSync] 📅 Syncing season: ${seasonId}`);
    
    const payload = {
      id: seasonId,
      season_name: seasonData.name,
      winners: JSON.stringify(seasonData.winners || {}),
      start_date: seasonData.startDate,
      end_date: seasonData.endDate,
      updated_at: new Date().toISOString()
    };
    
    try {
      const { data, error } = await this.supabase
        .from('season_history')
        .upsert([payload]);

      if (error) {
        const { data: updateData, error: updateError } = await this.supabase
          .from('season_history')
          .update(payload)
          .eq('id', seasonId);
        
        if (updateError) {
          const { data: insertData, error: insertError } = await this.supabase
            .from('season_history')
            .insert([payload]);
          if (insertError) throw insertError;
          return insertData;
        }
        return updateData;
      }
      console.log(`[UniversalSync] ✅ Season synced`);
      return data;
    } catch (err) {
      console.error(`[UniversalSync] ❌ Season sync error:`, err);
      throw err;
    }
  }

  /* ====================================
     QUEUE MANAGEMENT
     ==================================== */
  
  removeFromQueue(operation) {
    this.syncQueue = this.syncQueue.filter(item => 
      !(item.collection === operation.collection && item.id === operation.id)
    );
  }

  async syncQueuedData() {
    if (this.isSyncing || !this.isOnline) return;
    
    this.isSyncing = true;
    const itemsToSync = [...this.syncQueue];
    
    console.log(`[UniversalSync] 🔄 Syncing ${itemsToSync.length} queued items...`);
    
    let synced = 0;
    for (const item of itemsToSync) {
      try {
        await this.syncToSupabase(item);
        synced++;
      } catch (err) {
        console.error(`[UniversalSync] Retry failed for ${item.collection}:`, err);
      }
    }
    
    this.isSyncing = false;
    console.log(`[UniversalSync] ✅ Sync completed: ${synced}/${itemsToSync.length} items`);
  }

  /* ====================================
     STATUS & DIAGNOSTICS
     ==================================== */
  
  getStatus() {
    return {
      isOnline: this.isOnline,
      queuedItems: this.syncQueue.length,
      isSyncing: this.isSyncing,
      lastOperations: this.syncQueue.slice(-5).map(op => ({
        collection: op.collection,
        id: op.id,
        timestamp: new Date(op.timestamp).toLocaleTimeString()
      }))
    };
  }

  getDetailedStatus() {
    return {
      status: this.getStatus(),
      queue: this.syncQueue,
      timestamp: new Date().toISOString()
    };
  }

  logStatus() {
    const status = this.getStatus();
    console.log('[UniversalSync] Status Report:');
    console.log(`  🌐 Online: ${status.isOnline}`);
    console.log(`  📦 Queued: ${status.queuedItems}`);
    console.log(`  🔄 Syncing: ${status.isSyncing}`);
    status.lastOperations.forEach(op => {
      console.log(`    • ${op.collection}/${op.id} @ ${op.timestamp}`);
    });
  }

  /* ====================================
     CLEANUP
     ==================================== */
  
  destroy() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    console.log('[UniversalSync] Destroyed');
  }
}

// Export for use
if (typeof window !== 'undefined') {
  window.UniversalSupabaseSync = UniversalSupabaseSync;
}
