import React from 'react'
import AdminNavbar from '../../components/admin/AdminNavbar'
import AdminSiderbar from '../../components/admin/AdminSidebar'
import { Outlet } from 'react-router-dom'
import { useAppContext } from '../../context/AppContext'
import { use } from 'react'
import { useEffect } from 'react'
import Loading from '../../components/Loading'



const Layout = () => {

//   const {isAdmin, fetchIsAdmin} = useAppContext()

// useEffect(() => {
//   fetchIsAdmin()
// }, [])


  return(
    <>
      <AdminNavbar />
      <div className='flex'>
        <AdminSiderbar />
        <div className='flex-1 px-4 py-10 md:px-10 has-[calc(100vh-64px)] overflow-y-auto'>
          <Outlet />
        </div>
      </div>
    </>
  ) 
}

export default Layout
