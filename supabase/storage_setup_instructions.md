# Supabase Storage Setup Instructions

## 1. Create Storage Bucket

1. Go to Supabase Dashboard > Storage
2. Click "Create a new bucket"
3. Configure the bucket:
   - **Bucket name**: `diagnosis-reports`
   - **Public bucket**: `false` (private bucket)
   - **File size limit**: `10MB`
   - **Allowed MIME types**: `application/pdf`

## 2. Create Storage Policies

After creating the bucket, go to Storage > Policies and create the following policies:

### Policy 1: Users can upload their own diagnosis reports
- **Policy name**: `Users can upload their own diagnosis reports`
- **Allowed operation**: `INSERT`
- **Target roles**: `authenticated`
- **Policy definition**:
```sql
bucket_id = 'diagnosis-reports' AND auth.uid()::text = (storage.foldername(name))[1]
```

### Policy 2: Users can view their own diagnosis reports
- **Policy name**: `Users can view their own diagnosis reports`
- **Allowed operation**: `SELECT`
- **Target roles**: `authenticated`
- **Policy definition**:
```sql
bucket_id = 'diagnosis-reports' AND auth.uid()::text = (storage.foldername(name))[1]
```

### Policy 3: Users can update their own diagnosis reports
- **Policy name**: `Users can update their own diagnosis reports`
- **Allowed operation**: `UPDATE`
- **Target roles**: `authenticated`
- **Policy definition**:
```sql
bucket_id = 'diagnosis-reports' AND auth.uid()::text = (storage.foldername(name))[1]
```

### Policy 4: Users can delete their own diagnosis reports
- **Policy name**: `Users can delete their own diagnosis reports`
- **Allowed operation**: `DELETE`
- **Target roles**: `authenticated`
- **Policy definition**:
```sql
bucket_id = 'diagnosis-reports' AND auth.uid()::text = (storage.foldername(name))[1]
```

## 3. File Organization Structure

Files will be organized in the bucket using the following structure:
```
diagnosis-reports/
├── {user_id}/
│   ├── diagnostico-{user_id}-{timestamp}.pdf
│   ├── diagnostico-{user_id}-{timestamp}.pdf
│   └── ...
```

This structure ensures:
- Each user has their own folder (identified by user_id)
- Files are uniquely named with timestamp
- RLS policies can easily identify ownership based on folder structure

## 4. Environment Variables

Make sure the following environment variables are set in your application:

```env
VITE_SUPABASE_URL=https://corrklfwxfuqusfzwbls.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNvcnJrbGZ3eGZ1cXVzZnp3YmxzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3MzU0MTUsImV4cCI6MjA2NTMxMTQxNX0.r4nWkV2bnniYUl1wdyNO0dXrATVaRMHjCr4Qaq5Plmw
VITE_SUPABASE_STORAGE_BUCKET=diagnosis-reports
```

## 5. Testing Storage Setup

After setup, you can test the storage configuration by:

1. Creating a test file upload in your application
2. Verifying the file appears in the correct user folder
3. Testing that users can only access their own files
4. Confirming signed URLs work for PDF viewing

## 6. Backup and Retention Policy

Consider implementing:
- Regular backups of the storage bucket
- Data retention policy (e.g., keep reports for 7 years for medical compliance)
- Automated cleanup of old files if needed
- Monitoring storage usage and costs