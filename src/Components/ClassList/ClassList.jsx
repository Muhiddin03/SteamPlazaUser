import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebase';
import { FiArrowLeft, FiLoader, FiAlertTriangle, FiUser, FiSearch } from 'react-icons/fi';

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
      // 1. Sinflarni olish
      const q = query(collection(db, 'classes'), where('number', '==', Number(grade)));
      const classSnapshot = await getDocs(q);
      const fetchedClasses = classSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // 2. Foydalanuvchilarni olish (o'qituvchilar uchun)
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const usersMap = new Map();
      usersSnapshot.docs.forEach(doc => {
        usersMap.set(doc.id, doc.data());
      });

      // 3. Sinflar bilan o'qituvchi nomini birlashtirish
      const classesWithTeachers = fetchedClasses.map(cls => {
        const teacher = usersMap.get(cls.teacherId);
        return {
          ...cls,
          teacherName: teacher ? teacher.name : "Noma'lum"
        };
      });

      setClasses(classesWithTeachers);
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
      <div className="flex flex-col items-center justify-center min-h-screen bg-green-50 p-6">
        <div className="flex items-center">
          <FiLoader className="animate-spin h-12 w-12 text-green-700" />
          <p className="ml-3 text-lg font-medium text-green-900">Yuklanmoqda...</p>
        </div>
        <p className="mt-4 text-green-800 text-center">Sinflar ma'lumotlari yuklanmoqda, iltimos kuting.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-green-50 p-6 text-green-900">
        <FiAlertTriangle className="h-16 w-16 mb-4 text-green-700" />
        <p className="text-xl mb-4 text-center font-medium">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors duration-200"
        >
          Qayta urinish
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-green-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="flex items-center mb-8">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center text-green-800 hover:text-green-900 transition-colors duration-200 mr-4 p-2 rounded-lg hover:bg-green-100"
          >
            <FiArrowLeft className="h-6 w-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-green-900">{grade}-sinf</h1>
            <p className="text-green-700 mt-1">Sinflar ro'yxati</p>
          </div>
        </div>

        {/* Search Box */}
        {/* <div className="mb-8">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-green-600" />
            </div>
            <input
              type="text"
              placeholder="Sinflarni qidirish..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-3 w-full border border-green-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-green-900 placeholder-green-600"
            />
          </div>
        </div> */}

        {filteredClasses.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-green-200">
            <FiAlertTriangle className="h-16 w-16 mx-auto mb-4 text-green-600" />
            <h3 className="text-2xl font-semibold text-green-900 mb-2">
              {classes.length > 0 && searchQuery ? "Sinflar topilmadi" : "Sinflar mavjud emas"}
            </h3>
            <p className="text-green-800">
              {classes.length > 0 && searchQuery 
                ? "Qidiruv bo'yicha sinflar topilmadi. Boshqa kalit so'zlar bilan urunib ko'ring." 
                : "Bu sinf raqamida hali sinflar mavjud emas."
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredClasses.map(cls => (
              <div
                key={cls.id}
                onClick={() => navigate(`/school/${cls.id}/students`)}
                className="bg-white rounded-xl shadow-sm border border-green-200 p-6 hover:shadow-md transition-all duration-300 cursor-pointer hover:border-green-400"
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-full bg-green-100 text-green-700">
                      <span className="font-bold text-lg">{cls.number}</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-green-900 mb-1">
                      {cls.number}-{cls.name}
                    </h3>
                    <p className="text-sm text-green-800 flex items-center mt-2">
                      <FiUser className="h-4 w-4 mr-2 text-green-600" />
                      <span className="font-medium">O'qituvchi: {cls.teacherName}</span>
                    </p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-green-100">
                  <p className="text-sm text-green-700 text-center">
                    O'quvchilarni ko'rish uchun bosing
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info Section */}
        <div className="mt-8 p-5 bg-green-100 rounded-xl border border-green-200">
          <h3 className="font-semibold text-green-900 mb-2">Ma'lumot:</h3>
          <p className="text-green-800 text-sm">
            Sinflar ro'yxati {grade}-sinf uchun ko'rsatilmoqda. Har bir sinfni bosing 
            va o'quvchilar ro'yxatini ko'ring yoki bolalarni olib ketish so'rovini yuboring.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ClassList;