#!/usr/bin/env tsx

/**
 * Integration Validation Script
 * 
 * This script runs comprehensive validation tests for the Instituto Coração Valente integration.
 * It can be run manually or as part of CI/CD pipeline.
 * 
 * Usage:
 *   npm run validate:integration
 *   or
 *   npx tsx scripts/validate-integration.ts
 */

import { IntegrationValidator } from '../src/utils/integration-validator';
import { TestEnvironment } from '../src/utils/test-environment';

async function main() {
  console.log('🚀 Starting Instituto Integration Validation');
  console.log('============================================\n');

  try {
    // Initialize test environment
    TestEnvironment.configure({
      enabled: true,
      mockResponses: true,
      logRequests: false
    });

    // Create validator and run tests
    const validator = new IntegrationValidator();
    const report = await validator.validateIntegration();

    // Print report to console
    IntegrationValidator.printReport(report);

    // Save report to file
    const reportJson = IntegrationValidator.exportReport(report);
    const fs = await import('fs');
    const path = await import('path');
    
    const reportsDir = path.join(process.cwd(), 'reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    const reportFile = path.join(reportsDir, `integration-validation-${Date.now()}.json`);
    fs.writeFileSync(reportFile, reportJson);
    
    console.log(`📄 Report saved to: ${reportFile}`);

    // Exit with appropriate code
    if (report.overallStatus === 'FAIL') {
      console.log('\n❌ Validation FAILED - Some critical tests did not pass');
      process.exit(1);
    } else if (report.overallStatus === 'WARNING') {
      console.log('\n⚠️  Validation completed with WARNINGS - Review failed tests');
      process.exit(0);
    } else {
      console.log('\n✅ Validation PASSED - All tests completed successfully');
      process.exit(0);
    }

  } catch (error) {
    console.error('\n💥 Validation script failed:', error);
    process.exit(1);
  }
}

// Handle CLI arguments
const args = process.argv.slice(2);
const options = {
  verbose: args.includes('--verbose') || args.includes('-v'),
  export: args.includes('--export') || args.includes('-e'),
  help: args.includes('--help') || args.includes('-h')
};

if (options.help) {
  console.log(`
Instituto Integration Validation Script

Usage: npx tsx scripts/validate-integration.ts [options]

Options:
  -v, --verbose    Show detailed output
  -e, --export     Export report to JSON file
  -h, --help       Show this help message

Examples:
  npx tsx scripts/validate-integration.ts
  npx tsx scripts/validate-integration.ts --verbose
  npx tsx scripts/validate-integration.ts --export
`);
  process.exit(0);
}

// Run the validation
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});