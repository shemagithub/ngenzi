import React from 'react';
import { Linkedin, Twitter, Instagram, Facebook, Users } from 'lucide-react';

const TeamMember = ({ name, position, bio, image, social = {} }) => {
  return (
    <div className="bg-white dark:bg-haven-900 p-4 md:p-6 rounded-xl shadow-haven hover:shadow-lg transition-all w-full max-w-sm mx-auto border border-cream-400 dark:border-haven-700">
      <div className="flex flex-col items-center">
        {image ? (
          <img
            src={image}
            alt={name}
            className="w-24 h-24 md:w-32 md:h-32 rounded-full mb-3 md:mb-4 object-cover border-2 border-cream-400 dark:border-haven-600"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextElementSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div 
          className={`w-24 h-24 md:w-32 md:h-32 rounded-full mb-3 md:mb-4 bg-cream-100 dark:bg-haven-800 border border-cream-400 dark:border-haven-600 flex items-center justify-center ${image ? 'hidden' : ''}`}
        >
          <Users className="w-12 h-12 md:w-16 md:h-16 text-accent-500" />
        </div>
        <h3 className="font-display text-lg md:text-xl text-haven-900 dark:text-cream-100 text-center mb-1">{name}</h3>
        <p className="text-accent-600 dark:text-accent-400 text-xs md:text-sm text-center mb-2 md:mb-3 uppercase tracking-[0.12em] font-semibold">{position}</p>
        {bio && (
          <p className="text-haven-700/70 dark:text-cream-200/60 text-sm md:text-base text-center mb-3 md:mb-4 leading-relaxed">{bio}</p>
        )}
        {(social.linkedin || social.twitter || social.instagram || social.facebook) && (
          <div className="flex justify-center space-x-4">
            {social.linkedin && (
              <a 
                href={social.linkedin} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-haven-400 dark:text-haven-500 hover:text-accent-600 dark:hover:text-accent-400 transition-colors"
              >
                <Linkedin className="w-4 h-4 md:w-5 md:h-5" />
              </a>
            )}
            {social.twitter && (
              <a 
                href={social.twitter} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-haven-400 dark:text-haven-500 hover:text-accent-600 dark:hover:text-accent-400 transition-colors"
              >
                <Twitter className="w-4 h-4 md:w-5 md:h-5" />
              </a>
            )}
            {social.instagram && (
              <a 
                href={social.instagram} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-haven-400 dark:text-haven-500 hover:text-accent-600 dark:hover:text-accent-400 transition-colors"
              >
                <Instagram className="w-4 h-4 md:w-5 md:h-5" />
              </a>
            )}
            {social.facebook && (
              <a 
                href={social.facebook} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-haven-400 dark:text-haven-500 hover:text-accent-600 dark:hover:text-accent-400 transition-colors"
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
