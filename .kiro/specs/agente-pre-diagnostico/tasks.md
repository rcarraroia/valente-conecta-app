# Implementation Plan

- [x] 1. Setup database schema and types






  - Create Supabase migration for `relatorios_diagnostico` table with proper indexes
  - Create Supabase migration for `diagnosis_sessions` table for chat history
  - Generate TypeScript types from new database schema



  - Update existing database types file to include new tables
  - _Requirements: 4.5, 5.1, 6.5_

- [x] 2. Implement core data models and interfaces



  - Create TypeScript interfaces for `DiagnosisReport`, `DiagnosisSession`, and `ChatMessage`
  - Create TypeScript interfaces for n8n webhook communication (`N8nWebhookRequest`, `N8nWebhookResponse`)
  - Create error handling types and enums for diagnosis-specific errors
  - Create validation schemas using Zod for all diagnosis-related data structures
  - _Requirements: 6.1, 6.2, 6.3_

- [x] 3. Create diagnosis chat service




  - Implement `ChatService` class with methods for webhook communication
  - Add retry logic with exponential backoff for n8n webhook calls
  - Implement timeout handling (30 seconds) with proper error messages
  - Add request/response logging for debugging and monitoring
  - Create unit tests for `ChatService` with mock webhook responses
  - _Requirements: 3.3, 3.4, 3.6, 6.1, 6.2_




- [x] 4. Implement PDF generation service





  - Install and configure PDF generation library (react-pdf or similar)
  - Create `PDFService` class with methods to convert JSON diagnosis data to PDF
  - Design PDF template with proper formatting for diagnosis reports
  - Implement PDF generation with patient info, symptoms, analysis, and recommendations


  - Add error handling for PDF generation failures with fallback options
  - Create unit tests for PDF generation with sample diagnosis data
  - _Requirements: 4.1, 4.2, 4.7, 6.4_

- [x] 5. Create Supabase storage service


  - Implement `StorageService` class for PDF upload/download operations
  - Configure Supabase storage bucket for diagnosis reports with proper permissions
  - Add methods for generating unique PDF filenames with user_id and timestamp
  - Implement signed URL generation for secure PDF access
  - Add retry logic for storage operations with proper error handling
  - Create unit tests for storage operations with mock Supabase client
  - _Requirements: 4.3, 4.4, 5.4, 6.4_

- [x] 6. Implement diagnosis chat hook



  - Create `useDiagnosisChat` hook for managing chat state and communication
  - Add methods for starting chat session, sending messages, and handling responses
  - Implement real-time message updates with proper state management
  - Add loading states and error handling for all chat operations
  - Integrate with `ChatService` for webhook communication
  - Create unit tests for chat hook with mock service responses
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.7_

- [x] 7. Create reports management hook

  - Implement `useReports` hook for fetching and managing user reports
  - Add methods for listing reports, filtering by date, and handling report actions
  - Integrate with Supabase to query `relatorios_diagnostico` table
  - Implement real-time updates when new reports are created
  - Add error handling and loading states for all report operations
  - Create unit tests for reports hook with mock Supabase responses
  - _Requirements: 5.1, 5.2, 5.5, 5.6_

- [x] 8. Build diagnosis dashboard component
  - Create `DiagnosisDashboard` component with user-friendly interface
  - Add "Start Diagnosis" button that navigates to chat interface
  - Implement reports list section showing user's previous diagnoses
  - Add responsive design for mobile and desktop devices
  - Integrate with `useAuth` hook for user authentication checks
  - Add loading states and error boundaries for robust user experience
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 7.1, 7.4_

- [ ] 9. Implement chat interface component
  - Create `DiagnosisChat` component with conversational UI design
  - Build message display area with proper styling for user and AI messages
  - Implement chat input field with send button and keyboard shortcuts
  - Add typing indicators and message status indicators (sending, sent, error)
  - Implement auto-scroll to latest messages and message history
  - Add responsive design optimized for mobile chat experience
  - _Requirements: 3.1, 3.2, 3.7, 7.2, 7.3_

- [ ] 10. Create PDF viewer and reports list components
  - Implement `ReportsList` component for displaying user's diagnosis history
  - Add `ReportItem` component with report metadata and view/download actions
  - Create PDF viewer integration for opening reports in browser/app
  - Add date filtering and sorting functionality for reports list
  - Implement responsive design for reports viewing on mobile devices
  - Add error handling for PDF loading failures with retry options
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 7.1, 7.5_

- [ ] 11. Integrate PDF generation with chat completion
  - Modify chat hook to detect final diagnosis response from n8n webhook
  - Implement automatic PDF generation when diagnosis is completed
  - Add PDF upload to Supabase storage with proper error handling
  - Save PDF metadata to `relatorios_diagnostico` table with user association
  - Add user notification when PDF report is ready for viewing
  - Create integration tests for complete chat-to-PDF workflow
  - _Requirements: 4.1, 4.3, 4.4, 4.5, 4.6_

- [ ] 12. Add authentication guards and routing
  - Extend existing `useAuth` hook to support diagnosis-specific authentication
  - Create route guards for diagnosis dashboard and chat pages
  - Implement automatic redirection to login for unauthenticated users
  - Add proper navigation between dashboard, chat, and reports views
  - Ensure authentication state persistence across diagnosis workflow
  - Create integration tests for authentication flow with diagnosis features
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.5_

- [ ] 13. Implement comprehensive error handling
  - Add global error boundary for diagnosis-related components
  - Implement specific error handling for network failures, timeouts, and API errors
  - Create user-friendly error messages with retry options where appropriate
  - Add error logging and monitoring integration for production debugging
  - Implement graceful degradation for offline scenarios
  - Create error handling tests covering all major failure scenarios
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

- [ ] 14. Add responsive design and mobile optimization
  - Ensure all diagnosis components work properly on mobile devices
  - Optimize chat interface for mobile keyboard and touch interactions
  - Implement responsive PDF viewing that works well on small screens
  - Add proper touch gestures and mobile navigation patterns
  - Test and optimize performance on mobile devices
  - Create responsive design tests for different screen sizes
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 15. Create integration tests and end-to-end testing
  - Write integration tests for complete diagnosis workflow from start to finish
  - Test authentication integration with diagnosis features
  - Create tests for PDF generation and storage integration
  - Add tests for error scenarios and recovery mechanisms
  - Implement end-to-end tests covering user journey from login to report viewing
  - Add performance tests for chat responsiveness and PDF generation speed
  - _Requirements: All requirements - comprehensive testing_

- [ ] 16. Add monitoring, logging, and analytics
  - Implement error tracking and logging for all diagnosis operations
  - Add performance monitoring for chat response times and PDF generation
  - Create analytics tracking for user engagement and completion rates
  - Add health checks for external service dependencies (n8n webhook, Supabase)
  - Implement alerting for critical failures in diagnosis workflow
  - Create monitoring dashboard for diagnosis system health
  - _Requirements: 6.5, plus operational requirements_