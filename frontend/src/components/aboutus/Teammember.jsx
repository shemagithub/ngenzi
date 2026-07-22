import React from 'react';
import { Linkedin, Twitter, Instagram, Facebook, Users } from 'lucide-react';

const TeamMember = ({ name, position, bio, image, social = {} }) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-xl shadow-sm hover:shadow-md transition-all w-full max-w-sm mx-auto border border-gray-200 dark:border-gray-700">
      <div className="flex flex-col items-center">
        {image ? (
          <img
            src={image}
            alt={name}
            className="w-24 h-24 md:w-32 md:h-32 rounded-full mb-3 md:mb-4 object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextElementSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div 
          className={`w-24 h-24 md:w-32 md:h-32 rounded-full mb-3 md:mb-4 bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center ${image ? 'hidden' : ''}`}
        >
          <Users className="w-12 h-12 md:w-16 md:h-16 text-white" />
        </div>
        <h3 className="text-lg md:text-xl font-semibold text-center mb-1 text-gray-900 dark:text-gray-100">{name}</h3>
        <p className="text-blue-600 dark:text-blue-400 text-xs md:text-sm text-center mb-2 md:mb-3">{position}</p>
        {bio && (
          <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base text-center mb-3 md:mb-4">{bio}</p>
        )}
        {(social.linkedin || social.twitter || social.instagram || social.facebook) && (
          <div className="flex justify-center space-x-4">
            {social.linkedin && (
              <a 
                href={social.linkedin} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <Linkedin className="w-4 h-4 md:w-5 md:h-5" />
              </a>
            )}
            {social.twitter && (
              <a 
                href={social.twitter} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <Twitter className="w-4 h-4 md:w-5 md:h-5" />
              </a>
            )}
            {social.instagram && (
              <a 
                href={social.instagram} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <Instagram className="w-4 h-4 md:w-5 md:h-5" />
              </a>
            )}
            {social.facebook && (
              <a 
                href={social.facebook} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <Facebook className="w-4 h-4 md:w-5 md:h-5" />
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamMember;