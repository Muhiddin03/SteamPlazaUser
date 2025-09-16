import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebase';
import { FiArrowLeft, FiLoader, FiAlertTriangle, FiSearch } from 'react-icons/fi';

const ClassList = () => {
  const { grade } = useParams();
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchClasses = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const q = query(collection(db, 'classes'), where('number', '==', Number(grade)));
      const querySnapshot = await getDocs(q);
      const fetchedClasses = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setClasses(fetchedClasses);
    } catch (err) {
      console.error("Sinflar ro'yxatini yuklashda xatolik:", err);
      setError("Sinflar ro'yxatini yuklashda xatolik yuz berdi.");
    } finally {
      setLoading(false);
    }
  }, [grade]);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  const filteredClasses = classes.filter(cls =>
    (cls.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <FiLoader className="animate-spin h-12 w-12 text-indigo-600" />
        <p className="ml-3 text-lg font-medium text-gray-700">Yuklanmoqda...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-red-600">
        <FiAlertTriangle className="h-16 w-16 mb-4" />
        <p className="text-xl mb-4 text-center">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto min-h-screen bg-gray-50">
      <div className="flex items-center mb-6">
        <button onClick={() => navigate(-1)} className="text-gray-600 hover:text-indigo-600 transition-colors duration-200 mr-4">
          <FiArrowLeft className="h-6 w-6" />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">{grade}-sinf</h1>
      </div>

      <div className="relative mb-6">
        <input
          type="text"
          placeholder="Sinf harfi bo'yicha qidirish..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
        />
        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
      </div>

      {filteredClasses.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <FiAlertTriangle className="h-12 w-12 mx-auto mb-3 text-gray-400" />
          <p>
            {classes.length > 0 && searchQuery ? "Qidiruv bo'yicha sinflar topilmadi." : "Bu sinf raqamida hali sinflar mavjud emas."}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <ul className="divide-y divide-gray-200">
            {filteredClasses.map(cls => (
              <li
                key={cls.id}
                onClick={() => navigate(`/school/${cls.id}/students`)}
                className="flex items-center justify-between py-4 px-4 hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
              >
                <div className="flex-1">
                  <span className="text-indigo-600 hover:text-indigo-800 font-medium transition-colors duration-200">
                    {cls.number}-{cls.name}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ClassList;