import React from 'react'
import Navbar from './components/Navbar'
import { Route, Routes, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Movies from './pages/Movies'
import MovieDetails from './pages/MovieDetails'
import SeatLayout from './pages/SeatLayout'
import MyBooking from './pages/MyBooking'
import Footer from './components/Footer'
import {Toaster} from 'react-hot-toast'
import Favorite from './pages/Favorite'
import Dashboard from './pages/admin/Dashboard.jsx'
import Addshows from './pages/admin/Addshows'
import ListShows from './pages/admin/ListShows.jsx'
import ListBookings from './pages/admin/ListBookings'
import Layout from './pages/admin/Layout'
const App = () => {

   const isAdminRoute = useLocation().pathname.startsWith('/admin')

  return (
    <>
       <Toaster />
       {!isAdminRoute && <Navbar/>}
       <Routes>
          <Route path='/' element={<Home/>} />
          <Route path='/movies' element={<Movies/>} />
          <Route path='/movies/:id' element={<MovieDetails/>} />
          <Route path='/movies/:id/:date' element={<SeatLayout/>} />
          <Route path='/my-bookings' element={<MyBooking/>} />
          <Route path='/favorites' element={<Favorite/>} />
          <Route path='/admin/*' element= {<Layout/>}>
             <Route index element={<Dashboard/>} />
             <Route path='add-shows' element={<Addshows/>} />
             <Route path='list-shows' element={<ListShows/>} />
             <Route path='list-bookings' element={<ListBookings/>} />
          </Route>

       </Routes>
       {!isAdminRoute && <Footer/>}
    </>
  )
}

export default App
