import React from 'react';
import ProfileForm from './ProfileForm';
import { useFitnessData } from '@/hooks/useFitnessData';

const ProfilePage = () => {
  const { profile, handleUpdateProfile } = useFitnessData();

  const handleProfileSave = async (updatedProfile: any) => {
    // Use the handleUpdateProfile method from the hook
    await handleUpdateProfile(updatedProfile);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <ProfileForm 
          profile={profile}
          onSave={handleProfileSave}
          standalone={true}
        />
      </div>
    </div>
  );
};

export default ProfilePage;
