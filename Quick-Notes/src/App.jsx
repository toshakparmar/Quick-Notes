import React from 'react';
import Background from './components/Background';
import Foreground from './components/Foreground';

function App() {
  return (
    <div className='relative w-full h-full bg-zinc-800'>
        <Background />
        <Foreground />
    </div>
  )
}

export default App
