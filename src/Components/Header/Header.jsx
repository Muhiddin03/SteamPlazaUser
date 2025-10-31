import React from 'react';
import { FiAward, FiBook } from 'react-icons/fi';
import spr from '../../assets/steamp.png';  
import { Link } from 'react-router-dom';

// `activeSection` va `onSectionChange` prop'lari orqali boshqariladi
const Header = ({ activeSection, onSectionChange }) => {
  return (
    <header className="bg-white shadow-md py-4 sticky top-0 z-50">
      <div className="container mx-auto px-4 flex justify-between items-center">
    <Link to={"/"}>
        <div className="flex items-center space-x-3">
<div >
  <img 
    src={spr} 
    alt="Logo" 
    className="w-16 h-16 object-cover rounded-full"
  />
</div>

          <h1 className="text-2xl font-bold text-green-900  sm:block">
            Steam Plaza
          </h1>
        </div></Link>

        <nav className="flex items-center space-x-4">
          <button
            onClick={() => onSectionChange('school')}
            className={`
              px-4 sm:px-6 py-2 rounded-full font-semibold transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-green-800 focus:ring-offset-2 flex items-center justify-center
              ${activeSection === 'school' ? 'bg-green-800 text-white' : 'text-gray-700 hover:text-yellow-500'}
            `}
          >
            <FiAward className="sm:mr-2" />
            <span className="hidden sm:inline">Maktab</span>
          </button>
          <button
            onClick={() => onSectionChange('kindergarten')}
            className={`
              px-4 sm:px-6 py-2 rounded-full font-semibold transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-green-800 focus:ring-offset-2 flex items-center justify-center
              ${activeSection === 'kindergarten' ? 'bg-green-800 text-white' : 'text-gray-700 hover:text-yellow-500'}
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