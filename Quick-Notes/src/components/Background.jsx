import React from 'react'

function Background() {
  return (
    <div className='fixed z-[2] w-full h-screen bg-zinc-900'>
      <h3 className='w-full py-10 flex justify-center text-zinc-500 text-xl font-semibold'>@CodeSmachers...</h3>
      <h1 className='absolute text-[6rem] text-zinc-600 top-1/2 left-1/2 -translate-x-[50%] -translate-y-[50%] leading-none tracking-tight font-semibold title-text-color'>Quick-Notes</h1>
    </div>
  )
}

export default Background