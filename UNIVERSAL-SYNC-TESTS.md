# 🧪 PE Hub - Universal Sync Verification Tests

## ✅ Pre-Test Checklist

- [ ] Python SQL executed in Supabase (from `supabase-schema.sql`)
- [ ] App loaded without errors
- [ ] Browser console shows `[UniversalSync] ✅ Initialized`
- [ ] Connected to internet

---

## 🧪 TEST 1: Verify Sync System is Active

### In Browser Console (F12):

```javascript
universalSync.logStatus()
```

### Expected Output:
```
[UniversalSync] Status Report:
  🌐 Online: true
  📦 Queued: 0
  🔄 Syncing: false
```

**Status:** ✅ PASS if you see this

---

## 🧪 TEST 2: Student Registration Sync

### Step 1: Register Student
1. Open PE Hub app
2. Go to **Create Account** (Student)
3. Fill form:
   - First Name: `TestSync`
   - Last Name: `Student1`
   - Email: `testsync.student1@test.com`
   - Class: `Year 7`
   - House: `Gryffindor`
   - Gender: `Male`
4. Click **Create Account**

### Step 2: Check Console
```javascript
universalSync.logStatus()
```

Should show queued item has been synced.

### Step 3: Verify in Supabase
1. Go to **Supabase Dashboard**
2. Click **students** table
3. Look for `TestSync Student1` entry

**Status:** ✅ PASS if data appears in Supabase

---

## 🧪 TEST 3: Teacher Registration Sync

### Step 1: Register Teacher
1. Open PE Hub app
2. Go to **Create Account** (Teacher)
3. Fill form:
   - Title: `Mr`
   - First Name: `TestSync`
   - Last Name: `Teacher1`
   - Email: `testsync.teacher1@test.com`
4. Click **Create Account**

### Step 2: Verify in Supabase
1. Go to **Supabase Dashboard**
2. Click **teachers** table
3. Look for `TestSync Teacher1` entry

**Status:** ✅ PASS if data appears

---

## 🧪 TEST 4: Assessment Creation Sync

### Step 1: Create Assessment
1. Log in as Teacher
2. Go to **Bulk Assessment**
3. Create an assessment for a student
4. Fill assessment form
5. Click **Submit & Award House Points**

### Step 2: Check Queue (Immediate)
```javascript
universalSync.logStatus()
```

### Step 3: Verify in Supabase (5 secs)
1. Go to **Supabase Dashboard**
2. Click **assessments** table
3. New entry should appear

**Status:** ✅ PASS if assessment synced

---

## 🧪 TEST 5: House Points Award Sync

### Step 1: Award Points (via assessment)
When you create an assessment and award points, they should sync.

### Step 2: Verify in Supabase
1. Go to **house_point_events** table
2. Should see new entry with student ID and points awarded

**Status:** ✅ PASS if points appear

---

## 🧪 TEST 6: Student Data Update Sync

### Step 1: Student Updates Profile
1. Log in as Student
2. Go to **Profile**
3. Change something (name, avatar, etc)
4. Save changes

### Step 2: Check Queue
```javascript
universalSync.getStatus()
```

### Step 3: Verify Supabase
1. Go to **students** table
2. Find the student
3. Changes should be reflected

**Status:** ✅ PASS if changes synced

---

## 🧪 TEST 7: Multi-Device Sync

### Setup
- Device A: Computer/PC
- Device B: Phone/Tablet

### Step 1: Device A - Create Assessment
1. Log in as Teacher on Device A
2. Create an assessment
3. Award points to a student

### Step 2: Device B - Check Data
1. Log in as same Teacher on Device B
2. Check student roster
3. **Points should be visible** ✅

**Status:** ✅ PASS if data synced between devices

---

## 🧪 TEST 8: Offline Queue

### Step 1: Go Offline
1. Close internet connection
2. Or use DevTools Throttling → Offline

### Step 2: Make Change
1. Create an assessment
2. Award points
3. Check console:

```javascript
universalSync.logStatus()
```

Should show **queuedItems > 0** ✅

### Step 3: Go Online
1. Restore internet connection
2. Wait 5 seconds
3. Check Supabase dashboard

Changes should now appear! ✅

**Status:** ✅ PASS if offline queue syncs

---

## 📊 Full Test Results Template

```
TEST RESULTS - PE HUB UNIVERSAL SYNC
====================================

Environment:
├─ Date: [TODAY]
├─ Browser: [CHROME/FIREFOX/SAFARI]
├─ Device: [COMPUTER/PHONE/TABLET]
└─ Network: [ONLINE/OFFLINE]

Tests:
├─ Test 1 (System Active):        [PASS ✅ / FAIL ❌]
├─ Test 2 (Student Sync):          [PASS ✅ / FAIL ❌]
├─ Test 3 (Teacher Sync):          [PASS ✅ / FAIL ❌]
├─ Test 4 (Assessment Sync):       [PASS ✅ / FAIL ❌]
├─ Test 5 (House Points Sync):    [PASS ✅ / FAIL ❌]
├─ Test 6 (Profile Update Sync):  [PASS ✅ / FAIL ❌]
├─ Test 7 (Multi-Device Sync):    [PASS ✅ / FAIL ❌]
└─ Test 8 (Offline Queue):        [PASS ✅ / FAIL ❌]

Summary:
├─ Total Tests: 8
├─ Passed: [X/8]
├─ Failed: [Y/8]
├─ Pass Rate: [XX%]
└─ Status: [READY / NEEDS FIX]
```

---

## 🔍 Debugging Tests

### If tests fail, check:

#### 1. Sync System Error
```javascript
// Check if universalSync exists
console.log(universalSync)

// Check for JS errors
// Look for red errors in console (F12)
```

#### 2. Supabase Connection
```javascript
// Test Supabase connection
supabase.auth.getSession().then(console.log)

// Should show session or null (not error)
```

#### 3. Table Access
In Supabase Dashboard:
- [ ] Tables visible in **students** section
- [ ] Can see table structure
- [ ] No permission errors

#### 4. Queue Status
```javascript
// Check what's in the queue
universalSync.getDetailedStatus()

// Should return object with:
// { status, queue, timestamp }
```

---

## 🚨 Common Issues & Fixes

### Issue 1: "universalSync is not defined"

**Cause:** Script not loaded

**Fix:**
1. Check that `universal-sync.js` exists in `/workspaces/Track/`
2. Check that `index.html` includes: `<script src="universal-sync.js"></script>`
3. Reload page (Ctrl+Shift+R hard refresh)

### Issue 2: Data not appearing in Supabase

**Cause:** Tables not created

**Fix:**
1. Open Supabase Dashboard
2. Go to **SQL Editor**
3. Run the SQL from `supabase-schema.sql`
4. Refresh and try again

### Issue 3: Offline queue not syncing

**Cause:** Network issue

**Fix:**
1. Check internet connection
2. Reload page
3. Try force sync:
   ```javascript
   await universalSync.syncQueuedData()
   ```

### Issue 4: Errors in console

**Fix:**
1. Take screenshot of error
2. Check `supabase-schema.sql` was fully executed
3. Check Supabase project URL matches
4. Verify user has authentication

---

## ✅ Success Criteria

All tests pass when:

- [ ] Sync system initializes without errors
- [ ] Student accounts sync to Supabase instantly
- [ ] Teacher accounts sync to Supabase instantly
- [ ] Assessments appear in assessments table
- [ ] House points appear in house_point_events table
- [ ] Student data changes sync immediately
- [ ] Same data visible on different devices
- [ ] Offline queue syncs when reconnected

---

## 🎯 Expected Performance

| Operation | Time | Status |
|-----------|------|--------|
| Save to localStorage | 0-10ms | ✅ Instant |
| Queue operation | 0-5ms | ✅ Instant |
| Sync to Supabase | 100-500ms | ✅ Fast |
| Multi-device visible | 1-5 secs | ✅ Quick |
| Offline queue syncs | 1-10 secs | ✅ Automatic |

---

## 📊 Test Report

After running all tests, record:

```
SUMMARY:
✅ System Health: FUNCTIONAL
✅ Data Integrity: VERIFIED
✅ Multi-Device: WORKING
✅ Offline Mode: FUNCTIONAL

Recommendation: READY FOR PRODUCTION
```

---

## 🚀 Next Steps After Tests

If all tests pass:

1. ✅ Users can work offline
2. ✅ Data syncs automatically
3. ✅ Multi-device access works
4. ✅ No data loss
5. ✅ Real-time updates

**You're ready to deploy!** 🎉

---

**Test Suite Version:** 1.0  
**Created:** April 12, 2024  
**Status:** ✅ Ready to Use
