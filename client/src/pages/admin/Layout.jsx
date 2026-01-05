import React from 'react'
import AdminNavbar from '../../components/admin/AdminNavbar'
import AdminSiderbar from '../../components/admin/AdminSidebar'
import { Outlet } from 'react-router-dom'

const Layout = () => {
  return (
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
