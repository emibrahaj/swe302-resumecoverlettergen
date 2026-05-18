# Testing Doc - Version 1

**Date:** 14/05 – 9 PM

---

## Authentication

| ID | Test case | Expected result | Status |
|---|---|---|---|
| AUTH-01 | Register new user | User appears in Supabase Auth and users table | Pass |
| AUTH-02 | Login with correct user credentials | User is redirected to dashboard | Pass |
| AUTH-03 | Login with wrong password | Error message appears, no login | Pass |
| AUTH-04 | Logout | User session is cleared | Pass |

---

## User Features

| ID | Test case | Expected result | Status |
|---|---|---|---|
| USER-01 | Open user dashboard after login | Dashboard loads without 401 errors | Pass |
| USER-02 | Create resume | Resume is saved correctly | Pass|
| USER-03 | View my resumes | Saved resumes appear | Pass |
| USER-04 | Edit resume | Updated data is saved and displayed | Pass |
| USER-05 | Delete resume | Resume is removed | Pass|
| USER-06 | Create cover letter | Cover letter is saved correctly | Pass|
| USER-07 | View cover letters | Saved cover letters appear | Pass |
| USER-08 | Edit cover letter | Updated text is saved | Not tested |
| USER-09 | Delete cover letter | Cover letter is removed | Fail|

---

## Resume Issues

### Layout issue

The **2-column layout** does not change anything. It behaves the same as the 1-column layout in the **Design / Layout** section.

### Certificate section issue

In the certificate section, there is only an option to add a certificate credential. This does not make sense because it should also include fields such as:

- Certificate title
- Certificate ID
- Credential link
- Certification provider

Example: similar to LinkedIn certificates.

---


## Job Board / Pro Features

| ID | Test case | Expected result | Status |
|---|---|---|---|
| JOB-01 | Open job board as free user | Company names are blurred and limited jobs are shown | Pass |
| JOB-02 | Toggle Pro mode | Company names unblur and all jobs show | Pass |
| JOB-03 | Open job details | Correct job data appears | Pass |
| JOB-04 | Apply to job | Application is saved | Pass |

---

## JOB-01: Free User Job Board - PASS

## JOB-02: Pro Mode Job Board - PASS


## Error / Edge Cases

| ID | Test case | Expected result | Status |
|---|---|---|---|
| ERR-01 | Open dashboard without login | No dashboard without login, as expected | Pass |
| ERR-02 | Use duplicate email registration | Clear error appears | Pass |
| ERR-03 | Submit empty forms | Validation errors appear | Pass |
| ERR-04 | Refresh after login | Session remains active | Pass |


---

## ERR-02: Duplicate Email Registration - PASS

## ERR-03: Empty Form Validation - PASS

### **Date: 15/05/2026 – 11 PM**

## Applying for a Job as a Free User

**Issue 1: Company name visibility**

When a free user applies to a job:

- On the job board, the **company name is blurred and not shown**.
- When the user clicks **Apply** and the application form opens, the **company name is revealed**.

**Issue 2: Tracking applications**

- After applying, a free user **cannot easily check the status of their applications**.
- It is unclear **where in the dashboard the user can view submitted applications**.

## Cover Letter Issues

**Date:** 17 May 2026  
**Time:** 5:23 PM  

### CL-01: Delete cover letter

- **Test case:** Delete an existing cover letter.
- **Expected result:** The selected cover letter should be permanently deleted and should not appear again after logout/login.
- **Actual result:** The cover letter is not deleted. Even after logging out and logging back in, it is still displayed.
- **Status:** Failed

### CL-02: Edit existing cover letter

- **Test case:** Edit an already created cover letter.
- **Expected result:** The editor should open with the saved cover letter content already filled in.
- **Actual result:** The edit page opens an empty default cover letter. The preview shows the filled version, but when opened for editing, the user has to start from the beginning.
- **Status:** Failed




**Time:** 6:15 PM 
### DB-01: New User Dashboard Shows Fake Application and Match Counts

- **Test case:** Create a new user account and open the dashboard before creating any resumes, cover letters, job applications, or job matches.
- **Expected result:** All dashboard statistics should show real user-specific data. For a new user, the values should be:
  - Total resumes: 0
  - Cover letters: 0
  - My applications: 0
  - Job matches: 0
- **Actual result:** Total resumes and cover letters correctly show 0, but “My applications” and “Job Matches” display fake/default numbers even though the new user has not applied to any jobs or generated any matches.
- **Status:** Failed
- **Priority:** Medium





## Signup Error Handling Bug  
**Time:** 7:45 PM  

Signup returns `422 Unprocessable Entity` when the password is invalid, but the frontend displays `[object Object]` instead of a proper error message.

### Expected Behavior
Display a readable message such as:
`Password must be at least 8 characters.`

### Fix Needed
- Add frontend password validation.
- Properly parse and display backend error responses.


## Dashboard Job Board Button Bug  
**Time:** 7:52 PM  

In the Pro user dashboard, the **Browse Job Board** button inside the dark blue **Your Job Matches** section does not work.

### Expected Behavior
The button should redirect the user to the Job Board page, the same way the **Find Jobs** button in the top navigation does.

### Fix Needed
Add the correct navigation/action to the **Browse Job Board** button, it should redirect to the jobs posted page yk.


# **Date: 18 May 2026**
### Passed Test Cases: Company Job Posts

- **JP-01: Create Job Post**  
  The company successfully created a new job post, and it appeared in the job posts list.  
  **Status:** Passed

- **JP-02: Edit Job Post**  
  The company successfully edited an existing job post, and the updated data was saved correctly.  
  **Status:** Passed

- **JP-03: Delete Job Post**  
  The company successfully deleted an existing job post, and it no longer appeared in the list.  
  **Status:** Passed

### Fixes Completed

- **CV Preview Fixed**  
  The CV live preview now displays the entered user information correctly and updates as expected.

- **User Dashboard Statistics Fixed**  
  The **Job Matches** and **Jobs Applied To / My Applications** statistics now show the correct real values instead of fake/default numbers.

- **Cover Letter Management Fixed**  
  Cover letter functionality is now working correctly:
  - Users can create cover letters.
  - Users can edit existing cover letters with the saved content already loaded.
  - Users can delete cover letters successfully, and deleted items no longer appear after logout/login.

- **View My Applications Button Added**  
  Added the **View My Applications** button for users, allowing them to access and review the jobs they have applied to directly from the user dashboard/navigation flow.

- **Browse Job Board Redirection Fixed**  
  Fixed the **Browse Job Board** button redirection. It now correctly redirects users to:    `http://localhost:3000/user/matched-jobs`


**Time:** 12 AM  

### JM-01: Job Recommendations Match User Profile and Background

- **Test case:** Create multiple users and multiple company accounts from different fields, then test whether job recommendations are filtered based on the user’s CV/profile background.

- **Test data/setup:**
  - Created several user profiles with different backgrounds:
    - Tech user
    - Finance user
    - Marketing user
    - Law user
  - Created several company accounts from different industries.
  - Companies posted jobs related to:
    - Technology
    - Finance
    - Marketing
    - Law

- **Expected result:**  
  When a specific user opens the job recommendation/matched jobs page, the system should show only jobs that match the user’s profile, CV skills, experience, and professional background.
- **Actual result:**  
  The job recommendation system correctly displayed jobs related to the user’s field. For example, a user with a design/tech background was shown relevant tech/design jobs instead of unrelated finance, law, or marketing jobs.
- **Status:** Passed




**Time:** 1 AM  
### JB-01: Job Board Filters Do Not Work Correctly

- **Test case:** Open the Job Board page and use the filter section to filter jobs by job type or location.

- **Steps tested:**
  1. Open the Job Board page.
  2. Select a job type filter, for example **Part-time**.
  3. Select a location filter, for example **Remote**.
  4. Check whether the job list updates based on the selected filter.

- **Expected result:**  
  The job list should update and show only jobs that match the selected filters.  
  For example:
  - If **Part-time** is selected, only part-time jobs should be displayed.
  - If **Remote** is selected, only remote jobs should be displayed.

- **Actual result:**  
  The filters do not work properly. When selecting **Part-time** or **Remote**, the job board still displays all jobs instead of filtering the list.

- **Additional note:**  
  The search bar works correctly, but the filter section does not apply filtering.

- **Status:** Failed
