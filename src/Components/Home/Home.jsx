import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiAward, FiBook, FiHome } from 'react-icons/fi';
import KindergartenGroupList from '../KindergartenGroupList/KindergartenGroupList';

const Home = ({ activeSection, onSectionChange }) => {
  const navigate = useNavigate();
  const schoolGrades = Array.from({ length: 5 }, (_, i) => i + 1);

  const handleNavigate = (path) => {
    navigate(path);
  };

  return (
    <div className="min-h-screen bg-green-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center mb-4">
            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-green-100 text-green-700">
              <FiHome className="h-8 w-8" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-green-900 mb-3">
            Steam Plaza
          </h1>
          <p className="text-lg text-green-800 max-w-3xl mx-auto">
            Endi farzandingizni Steam plaza maktabi va bog'chasidan olib ketish yanada qulay va xavfsiz!
            Bizning tizim orqali ota-onalar bolalarni tez, oson va ishonchli tarzda olib ketishlari mumkin.
          </p>
        </div>

        {/* Section Toggle Buttons */}
        <div className="flex justify-center space-x-4 mb-10">
          <button
            onClick={() => onSectionChange('school')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center ${
              activeSection === 'school' 
                ? 'bg-green-700 text-white shadow-md transform hover:scale-105' 
                : 'bg-white text-green-800 border border-green-300 hover:bg-green-50'
            }`}
          >
            <FiAward className="mr-2" />
            Maktab
          </button>
          <button
            onClick={() => onSectionChange('kindergarten')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center ${
              activeSection === 'kindergarten' 
                ? 'bg-green-700 text-white shadow-md transform hover:scale-105' 
                : 'bg-white text-green-800 border border-green-300 hover:bg-green-50'
            }`}
          >
            <FiBook className="mr-2" />
            Bog'cha
          </button>
        </div>

        {/* Content Section */}
        {activeSection === 'school' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {schoolGrades.map(grade => (
              <div
                key={grade}
                onClick={() => handleNavigate(`/school/${grade}`)}
                className="bg-white rounded-xl shadow-sm p-6 text-center cursor-pointer hover:shadow-md transition-all duration-300 border border-green-200 hover:border-green-400 hover:transform hover:scale-105"
              >
                <div className="flex items-center justify-center h-14 w-14 rounded-full bg-green-100 text-green-700 mx-auto mb-4">
                  <FiAward className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-green-900">{grade}-sinf</h3>
                <p className="text-sm text-green-700 mt-2">O'quvchilar ro'yxati</p>
              </div>
            ))}
          </div>
        ) : (
          <KindergartenGroupList />
        )}

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-green-200 text-center text-green-700 text-sm">
          <p>© {new Date().getFullYear()} Steam Plaza. Barcha huquqlar himoyalangan.</p>
        </div>
      </div>
    </div>
  );
};

export default Home;