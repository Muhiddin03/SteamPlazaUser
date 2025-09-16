import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiAward, FiBook } from 'react-icons/fi';

// `activeSection` va `onSectionChange` prop'larini qabul qiladi
const Home = ({ activeSection, onSectionChange }) => {
  const navigate = useNavigate();
  const schoolGrades = Array.from({ length: 5 }, (_, i) => i + 1);

  const handleNavigate = (path) => {
    navigate(path);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto min-h-screen bg-gray-50">
      <h1 className="text-3xl font-bold text-gray-800 text-center mb-6">
        Steam Plaza
      </h1>
      <p className="text-center text-lg text-gray-600 mb-10">
        Farzandingizni tezroq olib keting.
      </p>

      <div className="flex justify-center space-x-4 mb-8">
        <button
          onClick={() => onSectionChange('school')}
          className={`px-6 py-3 rounded-lg font-semibold transition-colors duration-300 flex items-center justify-center ${
            activeSection === 'school' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-gray-700 border border-gray-300'
          }`}
        >
          <FiAward className="mr-2" />
          Maktab
        </button>
        <button
          onClick={() => onSectionChange('kindergarten')}
          className={`px-6 py-3 rounded-lg font-semibold transition-colors duration-300 flex items-center justify-center ${
            activeSection === 'kindergarten' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-gray-700 border border-gray-300'
          }`}
        >
          <FiBook className="mr-2" />
          Bog'cha
        </button>
      </div>

      {activeSection === 'school' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {schoolGrades.map(grade => (
            <div
              key={grade}
              onClick={() => handleNavigate(`/school/${grade}`)}
              className="bg-white rounded-xl shadow-lg p-6 text-center cursor-pointer hover:shadow-2xl transition-all duration-300 border border-gray-200"
            >
              <FiAward className="h-12 w-12 text-indigo-600 mx-auto mb-3" />
              <h3 className="text-xl font-bold text-gray-800">{grade}-sinf</h3>
              <p className="text-sm text-gray-500 mt-1">Sinflarni ko'rish</p>
            </div>
          ))}
        </div>
      ) : (
        <div 
          className="bg-white rounded-xl shadow-lg p-6 text-center cursor-pointer hover:shadow-2xl transition-all duration-300 border border-gray-200"
          onClick={() => handleNavigate('/kindergarten')}
        >
          <FiBook className="h-12 w-12 text-indigo-600 mx-auto mb-3" />
          <h3 className="text-xl font-bold text-gray-800">Guruhlar ro'yxati</h3>
          <p className="text-sm text-gray-500 mt-1">Bog'cha guruhlarini ko'rish</p>
        </div>
      )}
    </div>
  );
};

export default Home;