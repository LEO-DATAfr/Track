/**
 * PE Hub - Supabase Sync Module for Teacher Operations
 * 
 * This module syncs all teacher operations (assessments, points, etc.) to Supabase
 * Ensuring data is accessible from any device, not just localStorage
 */

class SupabaseTeacherSync {
  constructor(supabaseClient) {
    this.supabase = supabaseClient;
    this.isOnline = navigator.onLine;
    this.syncQueue = [];
    this.isSyncing = false;
    
    // Initialize online/offline listeners
    window.addEventListener('online', () => this.handleOnline());
    window.addEventListener('offline', () => this.handleOffline());
  }

  /* ====================================
     CONNECTION STATUS
     ==================================== */
  
  handleOnline() {
    console.log('[SupabaseSync] 🔴 → 🟢 Connection restored, syncing queued data...');
    this.isOnline = true;
    this.syncQueuedData();
  }

  handleOffline() {
    console.log('[SupabaseSync] 🟢 → 🔴 Connection lost, queuing operations...');
    this.isOnline = false;
  }

  /* ====================================
     TEACHER ASSESSMENT SYNC
     ==================================== */
  
  async saveAssessmentToSupabase(assessmentData) {
    try {
      if (!this.isOnline) {
        console.log('[SupabaseSync] Offline: Queuing assessment');
        this.syncQueue.push({
          type: 'assessment',
          data: assessmentData,
          timestamp: Date.now()
        });
        return { success: true, queued: true };
      }

      // Save to Supabase
      const { data, error } = await this.supabase
        .from('assessments')
        .insert([{
          student_id: assessmentData.studentId,
          sport_key: assessmentData.sportKey,
          source: assessmentData.source || 'teacher',
          skills: JSON.stringify(assessmentData.skills),
          teacher_comment: assessmentData.teacherComment || '',
          total_points: assessmentData.totalPoints,
          created_at: assessmentData.createdAt,
          synced_at: new Date().toISOString()
        }]);

      if (error) throw error;

      console.log('[SupabaseSync] ✅ Assessment saved to Supabase:', data);
      return { success: true, data };
    } catch (err) {
      console.error('[SupabaseSync] ❌ Assessment sync failed:', err);
      
      // Queue for retry
      this.syncQueue.push({
        type: 'assessment',
        data: assessmentData,
        timestamp: Date.now()
      });
      
      return { success: false, error: err.message, queued: true };
    }
  }

  /* ====================================
     HOUSE POINTS SYNC
     ==================================== */
  
  async saveHousePointsToSupabase(pointsData) {
    try {
      if (!this.isOnline) {
        console.log('[SupabaseSync] Offline: Queuing points');
        this.syncQueue.push({
          type: 'housePoints',
          data: pointsData,
          timestamp: Date.now()
        });
        return { success: true, queued: true };
      }

      const { data, error } = await this.supabase
        .from('house_point_events')
        .insert([{
          student_id: pointsData.studentId,
          points: pointsData.points,
          source: pointsData.source,
          note: pointsData.note,
          created_at: pointsData.date,
          synced_at: new Date().toISOString()
        }]);

      if (error) throw error;

      console.log('[SupabaseSync] ✅ House points saved to Supabase:', data);
      return { success: true, data };
    } catch (err) {
      console.error('[SupabaseSync] ❌ Points sync failed:', err);
      
      this.syncQueue.push({
        type: 'housePoints',
        data: pointsData,
        timestamp: Date.now()
      });
      
      return { success: false, error: err.message, queued: true };
    }
  }

  /* ====================================
     STUDENT DATA SYNC
     ==================================== */
  
  async updateStudentDataToSupabase(studentData) {
    try {
      if (!this.isOnline) {
        console.log('[SupabaseSync] Offline: Queuing student update');
        this.syncQueue.push({
          type: 'studentUpdate',
          data: studentData,
          timestamp: Date.now()
        });
        return { success: true, queued: true };
      }

      const { data, error } = await this.supabase
        .from('students')
        .upsert([{
          id: studentData._id || studentData.id,
          first_name: studentData.firstName,
          last_name: studentData.familyName,
          email: studentData.email,
          house_points: studentData.housePoints,
          xp: studentData.xp,
          updated_at: new Date().toISOString()
        }], { onConflict: 'id' });

      if (error) throw error;

      console.log('[SupabaseSync] ✅ Student data synced to Supabase:', data);
      return { success: true, data };
    } catch (err) {
      console.error('[SupabaseSync] ❌ Student sync failed:', err);
      
      this.syncQueue.push({
        type: 'studentUpdate',
        data: studentData,
        timestamp: Date.now()
      });
      
      return { success: false, error: err.message, queued: true };
    }
  }

  /* ====================================
     TEACHER FEEDBACK/COMMENTS
     ==================================== */
  
  async saveFeedbackToSupabase(feedbackData) {
    try {
      if (!this.isOnline) {
        console.log('[SupabaseSync] Offline: Queuing feedback');
        this.syncQueue.push({
          type: 'feedback',
          data: feedbackData,
          timestamp: Date.now()
        });
        return { success: true, queued: true };
      }

      const { data, error } = await this.supabase
        .from('teacher_feedback')
        .insert([{
          student_id: feedbackData.studentId,
          teacher_id: feedbackData.teacherId,
          lesson_type: feedbackData.lessonType,
          feedback_text: feedbackData.text,
          mood: feedbackData.mood,
          created_at: feedbackData.createdAt,
          synced_at: new Date().toISOString()
        }]);

      if (error) throw error;

      console.log('[SupabaseSync] ✅ Feedback saved to Supabase:', data);
      return { success: true, data };
    } catch (err) {
      console.error('[SupabaseSync] ❌ Feedback sync failed:', err);
      
      this.syncQueue.push({
        type: 'feedback',
        data: feedbackData,
        timestamp: Date.now()
      });
      
      return { success: false, error: err.message, queued: true };
    }
  }

  /* ====================================
     BATCH OPERATIONS SYNC
     ==================================== */
  
  async syncBulkAssessments(assessmentsList) {
    console.log(`[SupabaseSync] 📦 Syncing ${assessmentsList.length} bulk assessments...`);
    
    const results = [];
    for (const assessment of assessmentsList) {
      const result = await this.saveAssessmentToSupabase(assessment);
      results.push(result);
    }
    
    const successful = results.filter(r => r.success).length;
    console.log(`[SupabaseSync] ✅ ${successful}/${assessmentsList.length} assessments synced`);
    
    return results;
  }

  /* ====================================
     SYNC QUEUED DATA
     ==================================== */
  
  async syncQueuedData() {
    if (this.isSyncing || !this.isOnline) return;
    
    this.isSyncing = true;
    console.log(`[SupabaseSync] 🔄 Syncing ${this.syncQueue.length} queued operations...`);
    
    const itemsToSync = [...this.syncQueue];
    this.syncQueue = [];
    
    let synced = 0;
    let failed = 0;
    
    for (const item of itemsToSync) {
      try {
        switch (item.type) {
          case 'assessment':
            await this.saveAssessmentToSupabase(item.data);
            synced++;
            break;
          case 'housePoints':
            await this.saveHousePointsToSupabase(item.data);
            synced++;
            break;
          case 'studentUpdate':
            await this.updateStudentDataToSupabase(item.data);
            synced++;
            break;
          case 'feedback':
            await this.saveFeedbackToSupabase(item.data);
            synced++;
            break;
          default:
            console.warn('[SupabaseSync] Unknown sync type:', item.type);
        }
      } catch (err) {
        console.error('[SupabaseSync] Retry failed:', err);
        failed++;
        // Re-queue for next sync attempt
        this.syncQueue.push(item);
      }
    }
    
    this.isSyncing = false;
    console.log(`[SupabaseSync] ✅ Sync complete: ${synced} successful, ${failed} failed`);
  }

  /* ====================================
     SYNC STATUS
     ==================================== */
  
  getStatus() {
    return {
      isOnline: this.isOnline,
      queuedItems: this.syncQueue.length,
      isSyncing: this.isSyncing
    };
  }

  getQueuedItems() {
    return this.syncQueue;
  }

  /* ====================================
     FETCH DATA FROM SUPABASE
     ==================================== */
  
  async getStudentAssessments(studentId) {
    try {
      const { data, error } = await this.supabase
        .from('assessments')
        .select('*')
        .eq('student_id', studentId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('[SupabaseSync] Failed to fetch assessments:', err);
      return [];
    }
  }

  async getStudentHousePoints(studentId) {
    try {
      const { data, error } = await this.supabase
        .from('house_point_events')
        .select('*')
        .eq('student_id', studentId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('[SupabaseSync] Failed to fetch house points:', err);
      return [];
    }
  }

  async getAllAssessments(limit = 100) {
    try {
      const { data, error } = await this.supabase
        .from('assessments')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('[SupabaseSync] Failed to fetch all assessments:', err);
      return [];
    }
  }

  /* ====================================
     INITIALIZE SUPABASE TABLES
     ==================================== */
  
  async ensureTablesExist() {
    console.log('[SupabaseSync] 🔧 Checking Supabase tables...');
    
    // This is for documentation - actual table creation should be done in Supabase dashboard
    const requiredTables = [
      'assessments',
      'house_point_events',
      'teacher_feedback',
      'students'
    ];
    
    console.log('[SupabaseSync] Required Supabase Tables:', requiredTables);
    console.log('[SupabaseSync] Please ensure these tables exist in your Supabase dashboard');
    
    return requiredTables;
  }
}

// Export for use in index.html
if (typeof window !== 'undefined') {
  window.SupabaseTeacherSync = SupabaseTeacherSync;
}
