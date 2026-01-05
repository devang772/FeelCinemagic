import React from 'react'
import { useState } from 'react'
import { dummyTrailers } from '../assets/assets'
import ReactPlayer from "react-player";
import BlurCircle from './BlurCircle'
import { PlayCircleIcon } from 'lucide-react';

const TrailerSection = () => {

  const [currentTrailer, setCurrentTrailer] = useState(dummyTrailers[0])

  return (
    <div className='px-6 md:px-16 lg:px-24 xl:px-44 py-20 overflow-hidden'>
      <p className='text-gray-300 font-medium text-llg max-w-[960px] mx-auto' >Trailers</p>

      <div className="relative px-6 md:px-16 lg:px-24 xl:px-0">
  <BlurCircle top="0px" right="0px" />

  <div className="relative z-10 max-w-[960px] mx-auto">
    <iframe
      src={currentTrailer.videoUrl}
      className="max-w-full aspect-video rounded-xl"
      allowFullScreen
    />
  </div>
</div>

    <div className='group grid grid-cols-4 gap-4 md:gap-8 mt-8 max-w-3xl mx-auto'>
      {dummyTrailers.map((trailer, index) => (
  <div
    key={index}
    className="relative cursor-pointer hover:-translate-y-1 transition group-hover:not-hover:opacity-50"
    onClick={() => setCurrentTrailer(trailer)}
  >
    <img
      src={trailer.image}
      alt="trailer"
      className="rounded-lg w-full h-full object-cover brightness-75"
    />
    <PlayCircleIcon
      strokeWidth={1.6}
      className="absolute top-1/2 left-1/2 w-6 h-6 md:w-10 md:h-10 transform -translate-x-1/2 -translate-y-1/2 text-white"
    />
  </div>
))}
  </div>
    </div>
  )
}

export default TrailerSection
