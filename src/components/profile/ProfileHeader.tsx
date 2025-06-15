
import React from 'react';
import { User } from 'lucide-react';

interface ProfileHeaderProps {
  userEmail?: string;
}

const ProfileHeader = ({ userEmail }: ProfileHeaderProps) => {
  return (
    <div className="flex items-center gap-4 mb-6">
      <div className="bg-cv-purple-soft p-3 rounded-full">
        <User className="w-6 h-6 text-white" />
      </div>
      <div>
        <h1 className="text-2xl font-heading font-bold text-cv-gray-dark">
          Meu Perfil
        </h1>
        <p className="text-cv-gray-light">
          {userEmail}
        </p>
      </div>
    </div>
  );
};

export default ProfileHeader;
