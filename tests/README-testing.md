# Konomi ISAchieve - Testing Guide

## Test Suite Overview

Comprehensive testing for Konomi ISAchieve CLI, API, and MCP server.

## Quick Start

```bash
# Install test dependencies
npm install

# Run all tests
npm test

# Run specific test suite
npm run test:api
npm run test:mcp
npm run test:deployment

# Run integration tests
npm run test:integration

# Run with coverage
npm run test:coverage
```

## Test Structure

```
tests/
├── konomi-test.js              # Main test runner
├── konomi-test.yaml            # Test configuration
├── api.integration.test.js     # API integration tests
├── mcp.integration.test.js     # MCP server tests
├── deployment.test.js          # Deployment tests
└── README.md                   # This file
```

## Test Configuration

Edit `tests/konomi-test.yaml` to configure:

- API endpoints and expected responses
- MCP tools and parameters
- CLI commands to test
- Deployment URLs
- Performance thresholds

## Running Specific Tests

### API Tests
```bash
# Test API health
node tests/konomi-test.js api

# Test specific endpoint
jest tests/api.integration.test.js -t "should list all available commands"
```

### MCP Tests
```bash
# Test MCP server
node tests/konomi-test.js mcp

# Test specific tool
jest tests/mcp.integration.test.js -t "should execute konomi_version tool"
```

### Deployment Tests
```bash
# Test live deployment
DEPLOY_URL=https://teslasolar.github.io/ISAchieve npm run test:deployment

# Test local deployment
DEPLOY_URL=http://localhost:8000 npm run test:deployment
```

## Environment Variables

```bash
# API Configuration
export KONOMI_URL=http://localhost:3000

# MCP Configuration
export KONOMI_MCP_URL=http://localhost:3001

# Deployment Configuration
export DEPLOY_URL=https://teslasolar.github.io/ISAchieve
```

## Test Coverage

Generate coverage reports:

```bash
npm run test:coverage
open coverage/index.html
```

## CI/CD Integration

Tests run automatically in GitHub Actions:

- On push to main
- On pull requests
- On deployment

See `.github/workflows/ci.yml` for configuration.

## Writing New Tests

### API Test Example
```javascript
it('should test new endpoint', async () => {
    const response = await fetch(`${API_URL}/api/new-endpoint`);
    const data = await response.json();
    expect(data.success).toBe(true);
});
```

### MCP Test Example
```javascript
it('should test new tool', async () => {
    const response = await fetch(`${MCP_URL}/execute`, {
        method: 'POST',
        body: JSON.stringify({
            tool: 'new_tool',
            args: { param: 'value' }
        })
    });
    expect(response.ok).toBe(true);
});
```

## Troubleshooting

### Tests Failing

1. Check server is running:
   ```bash
   npm run start:api &
   npm run start:mcp &
   ```

2. Verify configuration:
   ```bash
   node cli/konomi.js config show
   ```

3. Check logs:
   ```bash
   tail -f logs/konomi.log
   ```

### Timeout Errors

Increase timeout in test config:
```yaml
api:
  timeout: 10000  # 10 seconds
```

## Performance Testing

Run performance tests:
```bash
npm run test:performance
```

Benchmark specific operations:
```bash
node tests/konomi-test.js benchmark --operation=api
```

## Load Testing

Test under load:
```bash
# Install artillery
npm install -g artillery

# Run load test
artillery run tests/load-test.yaml
```

## Manual Testing

Interactive test mode:
```bash
node tests/konomi-test.js interactive
```

## Test Reports

View test reports:
```bash
# Generate HTML report
npm run test:report

# View in browser
open test-report.html
```

## Best Practices

1. **Always test locally first** before pushing
2. **Write tests for new features** before implementation
3. **Keep tests fast** - mock external services
4. **Use descriptive test names**
5. **Clean up after tests** - no side effects
6. **Test edge cases** and error conditions

## Support

For issues with tests, check:
- [GitHub Issues](https://github.com/teslasolar/ISAchieve/issues)
- Test logs in `logs/test.log`
- CI/CD workflow runs
