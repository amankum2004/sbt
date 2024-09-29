import { useEffect, useState } from 'react'

const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536
}

const getDeviceSize = (width) => {
  if (width >= breakpoints['2xl']) return '2xl'
  if (width >= breakpoints.xl) return 'xl'
  if (width >= breakpoints.lg) return 'lg'
  if (width >= breakpoints.md) return 'md'
  if (width >= breakpoints.sm) return 'sm'
  return 'xs'
}

const useDeviceSize = () => {
  const [deviceSize, setDeviceSize] = useState(getDeviceSize(window.innerWidth))

  useEffect(() => {
    const handleResize = () => {
      setDeviceSize(getDeviceSize(window.innerWidth))
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return deviceSize
}

export default useDeviceSize
