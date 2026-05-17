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
| USER-02 | Create resume | Resume is saved correctly | Fail |
| USER-03 | View my resumes | Saved resumes appear | Pass |
| USER-04 | Edit resume | Updated data is saved and displayed | Fail |
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

## USER-02: Create Resume - FAIL

**Issue:**  
Information added by the user is not saved in the resume. Only the default resume data appears.

![Create resume fail - screenshot 1](images/media/image1.png)

![Create resume fail - screenshot 2](images/media/image2.png)

---

## USER-04: Edit Resume - FAIL

**Issue:**  
Updated resume data is not saved and displayed correctly.

---

## Job Board / Pro Features

| ID | Test case | Expected result | Status |
|---|---|---|---|
| JOB-01 | Open job board as free user | Company names are blurred and limited jobs are shown | Pass |
| JOB-02 | Toggle Pro mode | Company names unblur and all jobs show | Pass |
| JOB-03 | Open job details | Correct job data appears | Not tested |
| JOB-04 | Apply to job | Application is saved | Not tested |

---

## JOB-01: Free User Job Board - PASS

![Free user job board](images/media/image3.png)

---

## JOB-02: Pro Mode Job Board - PASS

![Pro mode job board](images/media/image4.png)

---

## Error / Edge Cases

| ID | Test case | Expected result | Status |
|---|---|---|---|
| ERR-01 | Open dashboard without login | No dashboard without login, as expected | Pass |
| ERR-02 | Use duplicate email registration | Clear error appears | Pass |
| ERR-03 | Submit empty forms | Validation errors appear | Pass |
| ERR-04 | Refresh after login | Session remains active | Pass |
| ERR-05 | Backend off, frontend request | Friendly error shown, no crash | Not tested |

---

## ERR-02: Duplicate Email Registration - PASS

![Duplicate email registration error](images/media/image5.png)

---

## ERR-03: Empty Form Validation - PASS

![Empty form validation error](images/media/image6.png)



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
