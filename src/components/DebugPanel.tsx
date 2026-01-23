// components/DebugPanel.tsx
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle, Server, User, Key } from 'lucide-react';

export const DebugPanel: React.FC = () => {
  const { user, token, testBackendConnection, checkToken, logout } = useAuth();
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  const runTests = async () => {
    setIsTesting(true);
    setTestResult(null);
    
    const results = [];
    
    try {
      // Test 1: Backend connection
      results.push({ test: 'Backend Connection', status: 'Running...' });
      const backendOk = await testBackendConnection();
      results.push({ test: 'Backend Connection', status: backendOk ? '✅ OK' : '❌ Failed' });
      
      // Test 2: Token check
      if (token) {
        results.push({ test: 'Token Validation', status: 'Running...' });
        const tokenOk = await checkToken();
        results.push({ test: 'Token Validation', status: tokenOk ? '✅ Valid' : '❌ Invalid' });
      } else {
        results.push({ test: 'Token Validation', status: '⚠️ No Token' });
      }
      
      // Test 3: User data
      results.push({ 
        test: 'User Data', 
        status: user ? '✅ Present' : '⚠️ None',
        details: user ? `Role: ${user.role}, Email: ${user.email}` : ''
      });
      
    } catch (error: any) {
      results.push({ test: 'Error', status: '❌', details: error.message });
    } finally {
      setTestResult(results);
      setIsTesting(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Server className="w-5 h-5" />
          System Debug Panel
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Status */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4" />
            <span className="font-medium">User Status:</span>
            {user ? (
              <span className="text-green-600 flex items-center gap-1">
                <CheckCircle className="w-4 h-4" />
                Logged in as {user.email}
              </span>
            ) : (
              <span className="text-yellow-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                Not logged in
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4" />
            <span className="font-medium">Token:</span>
            <span className={token ? 'text-green-600' : 'text-yellow-600'}>
              {token ? 'Present' : 'Missing'}
            </span>
          </div>
        </div>

        {/* Test Results */}
        {testResult && (
          <div className="border rounded-lg p-3 bg-gray-50">
            <h4 className="font-medium mb-2">Test Results:</h4>
            {testResult.map((result: any, index: number) => (
              <div key={index} className="text-sm flex justify-between items-center py-1">
                <span>{result.test}</span>
                <span className={result.status.includes('✅') ? 'text-green-600' : 
                                 result.status.includes('❌') ? 'text-red-600' : 
                                 'text-yellow-600'}>
                  {result.status}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-4">
          <Button 
            onClick={runTests} 
            disabled={isTesting}
            variant="outline"
            className="flex-1"
          >
            {isTesting ? 'Testing...' : 'Run Diagnostics'}
          </Button>
          
          {token && (
            <Button 
              onClick={logout}
              variant="destructive"
            >
              Force Logout
            </Button>
          )}
        </div>

        {/* Direct Test Links */}
        <div className="text-xs text-gray-500 pt-4 border-t">
          <p className="font-medium mb-1">Quick Tests:</p>
          <div className="space-y-1">
            <a 
              href="http://localhost:5000/api/health" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline block"
            >
              ↗ Test Backend Health
            </a>
            <a 
              href="http://localhost:5000/api/auth" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline block"
            >
              ↗ View Auth Endpoints
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};