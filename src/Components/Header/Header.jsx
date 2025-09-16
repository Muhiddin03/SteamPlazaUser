import React from 'react';
import { FiAward, FiBook } from 'react-icons/fi';

// `activeSection` va `onSectionChange` prop'lari orqali boshqariladi
const Header = ({ activeSection, onSectionChange }) => {
  return (
    <header className="bg-white shadow-md py-4 sticky top-0 z-50">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">SP</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 hidden sm:block">
            Steam Plaza
          </h1>
        </div>

        <nav className="flex items-center space-x-4">
          <button
            onClick={() => onSectionChange('school')}
            className={`
              px-4 sm:px-6 py-2 rounded-full font-semibold transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center
              ${activeSection === 'school' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:text-blue-600'}
            `}
          >
            <FiAward className="sm:mr-2" />
            <span className="hidden sm:inline">Maktab</span>
          </button>
          <button
            onClick={() => onSectionChange('kindergarten')}
            className={`
              px-4 sm:px-6 py-2 rounded-full font-semibold transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center
              ${activeSection === 'kindergarten' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:text-blue-600'}
            `}
          >
            <FiBook className="sm:mr-2" />
            <span className="hidden sm:inline">Bog'cha</span>
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;