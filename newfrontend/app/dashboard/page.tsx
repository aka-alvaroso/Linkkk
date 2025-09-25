"use client"
import ProtectedPage from '../components/ProtectedPage/ProtectedPage';
import Navbar from '../components/Navbar/Navbar';

export default function Dashboard() {
  return (
    <ProtectedPage type="user-only" title="Dashboard - Linkkk">
      <Navbar />
      <div className="mt-20 p-2 space-y-8 w-full md:max-w-3/4 md:mx-auto">
        <h1 className="text-4xl font-black mb-2 italic">/Dashboard</h1>
        
        {/* Widgets */}
        <div className='flex items-center gap-1 overflow-x-auto scrollbar-hide lg:grid lg:gap-2 lg:grid-cols-4'>
          <div className='p-2 max-w-48 min-w-48 bg-black/5 rounded-2xl md:max-w-full'>
            <h2 className='text-md'>Total links</h2>
            <p className='text-end text-5xl font-black italic'>182</p>
          </div>
          <div className='p-2 max-w-48 min-w-48 bg-black/5 rounded-2xl md:max-w-full'>
            <h2 className='text-md'>Total clicks</h2>
            <p className='text-end text-5xl font-black italic'>20.4M</p>
          </div>
          <div className='p-2 max-w-48 min-w-48 bg-black/5 rounded-2xl md:max-w-full'>
            <h2 className='text-md'>Active links</h2>
            <p className='text-end text-5xl font-black italic'>140</p>
          </div>
          <div className='p-2 max-w-48 min-w-48 bg-black/5 rounded-2xl md:max-w-full'>
            <h2 className='text-md'>API usage</h2>
            <p className='text-end text-5xl font-black italic'>85<span className='text-xl text-dark/60'>/100</span></p>
          </div>
        </div>

        {/* Filters */}
        <div>
          {/* Contenido de filtros aquí */}
        </div>
      </div>
    </ProtectedPage>
  );
}