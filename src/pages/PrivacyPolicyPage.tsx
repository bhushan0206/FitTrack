import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const PrivacyPolicyPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-black px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border border-gray-200/50 dark:border-gray-600/50 rounded-2xl shadow-2xl">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white text-center">
              Privacy Policy
            </CardTitle>
            <p className="text-gray-600 dark:text-gray-300 text-center">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none">
            <div className="space-y-6 text-gray-700 dark:text-gray-300">
              <section>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Data We Collect</h2>
                <p>When you use FitTrack, we collect:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Basic profile information (name, email) from your Facebook account</li>
                  <li>Fitness tracking data you voluntarily enter</li>
                  <li>Usage analytics to improve our service</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">How We Use Your Data</h2>
                <p>Your data is used to:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Provide personalized fitness tracking</li>
                  <li>Generate progress reports and insights</li>
                  <li>Improve our service features</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Data Deletion</h2>
                <p>
                  You can request deletion of your data at any time by visiting our{' '}
                  <a href="/data-deletion" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                    data deletion page
                  </a>
                  . We will process your request within 30 days.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Contact Us</h2>
                <p>
                  If you have questions about this privacy policy, please contact us at{' '}
                  <a href="mailto:privacy@fittrack.app" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                    privacy@fittrack.app
                  </a>
                </p>
              </section>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
