**Authentication**

  ----------------------------------------------------------------------
  **ID**    **Test case**        **Expected result**        **Status**
  --------- -------------------- -------------------------- ------------
  AUTH-01   Register new user    User appears in Supabase   Pass
                                 Auth and users table       

  AUTH-02   Login with correct   User is redirected to      Pass
            user credentials     dashboard                  

  AUTH-03   Login with wrong     Error message appears, no  Pass
            password             login                      

  AUTH-04   Logout               User session is cleared    Pass
  ----------------------------------------------------------------------

User features

  -----------------------------------------------------------
  ID        Test case          Expected result       Status
  --------- ------------------ --------------------- --------
  USER-01   Open user          Dashboard loads       Pass
            dashboard after    without 401 errors    
            login                                    

  USER-02   Create resume      Resume is saved       Fail
                               correctly             

  USER-03   View my resumes    Saved resumes appear  Pass

  USER-04   Edit resume        Updated data is saved Fail
                               and displayed         

  USER-05   Delete resume      Resume is removed     

  USER-06   Create cover       Cover letter is saved 
            letter             correctly             

  USER-07   View cover letters Saved cover letters   
                               appear                

  USER-08   Edit cover letter  Updated text is saved 

  USER-09   Delete cover       Cover letter is       
            letter             removed               
  -----------------------------------------------------------

**Resume**

2-column layout -\> Nothing happens same as the 1 column layout ( in the
desing- layout section)

Te certificate- ka vetem add certificate credential -\> sben sens duhet
t kishte titull- Id/link/credential cerficiation si ne Linkedin prsh

**USER-02: Create Resume- FAIL**

Information added is not saved in the resume, only the default one

![](images/media/image1.png){width="10.0in"
height="0.2972222222222222in"}

![](images/media/image2.png){width="10.0in"
height="5.9222222222222225in"}

**USER-04: Edit Resume- FAIL**

Job board / Pro features

  --------------------------------------------------------------
  ID       Test case        Expected result             Status
  -------- ---------------- --------------------------- --------
  JOB-01   Open job board   Company names are           Pass
           as free user     blurred/limited jobs shown  

  JOB-02   Toggle Pro mode  Company names unblur and    Pass
                            all jobs show               

  JOB-03   Open job details Correct job data appears    

  JOB-04   Apply to job     Application is saved        
  --------------------------------------------------------------

**Job-01- PASS**

![](images/media/image3.png){width="9.17807852143482in"
height="4.1771161417322835in"}

**Job-02-PASS**

![](images/media/image4.png){width="7.055524934383202in"
height="3.3427876202974627in"}

**Error/edge cases**

  --------------------------------------------------------------
  **ID**   **Test case**    **Expected      **Status**
                            result**        
  -------- ---------------- --------------- --------------------
  ERR-01   Open dashboard                   No dashboard without
           without login                    login, as expected

  ERR-02   Use duplicate    Clear error     Pass
           email            appears         
           registration                     

  ERR-03   Submit empty     Validation      Pass
           forms            errors appear   

  ERR-04   Refresh after    Session remains Pass
           login            active          

  ERR-05   Backend off,     Friendly error  
           frontend request shown, no crash 
  --------------------------------------------------------------

ERR-02 PASS

![](images/media/image5.png){width="4.151946631671041in"
height="4.169957349081365in"}

ERR-03 PASS

![](images/media/image6.png){width="4.698572834645669in"
height="2.0211154855643043in"}
