import React from 'react';

const Background = () => {
  return (
    <div className="fixed z-[2] w-full h-full bg-zinc-900">
      <h1 className='absolute text-[3rem] sm:text-[4rem] md:text-[5rem] lg:text-[6rem] 
                     text-zinc-600 top-1/2 left-1/2 -translate-x-[50%] -translate-y-[130%] leading-none tracking-tight font-semibold title-text-color text-center px-4'>
        Quick-Notes
      </h1>
    </div>
  );
};

export default Background;