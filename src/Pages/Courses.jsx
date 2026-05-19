import React from "react";
import Kurslar from "../components/Kurslar";

const CoursesPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-10">
      {/* 
        Biz Kurslar komponentini alohida qilib tayyorlaganmiz.
        U yerda barcha simmetriya, grid va xavfsizlik qoidalari yozilgan.
        Shu sababli bu sahifada uni shunchaki chaqirib qo'yamiz.
      */}
      <Kurslar />
    </div>
  );
};

export default CoursesPage;
