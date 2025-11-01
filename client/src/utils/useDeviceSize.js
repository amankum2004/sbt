// files to update 
// forget , resend otp , reset password, slot booking with failure




// Now you can use the enhanced API with better error handling:

// import { api, apiUtils } from '../utils/api'
// // Basic usage with better error handling
// try {
//   const response = await api.post('/time/template/create', formData)
//   console.log('Success:', response.data)
// } catch (error) {
//   console.error('API Error:', error.message)
//   console.error('Error details:', error.details)
  
//   // Show user-friendly error message
//   alert(error.message)
// }

// // With loading state
// try {
//   const data = await apiUtils.callWithLoading(
//     () => api.put(`/time/template/${templateId}`, formData),
//     (isLoading) => setIsSubmitting(isLoading)
//   )
//   console.log('Success:', data)
// } catch (error) {
//   console.error('Error:', error.message)
// }

// // With retry logic
// try {
//   const data = await apiUtils.retry(
//     () => api.get('/time/shops/123/available'),
//     3, // max retries
//     1000 // initial delay
//   )
//   console.log('Success after retry:', data)
// } catch (error) {
//   console.error('Failed after retries:', error.message)
// }











// import { useEffect, useState } from 'react'
// const breakpoints = {
//   sm: 640,
//   md: 768,
//   lg: 1024,
//   xl: 1280,
//   '2xl': 1536
// }

// const getDeviceSize = (width) => {
//   if (width >= breakpoints['2xl']) return '2xl'
//   if (width >= breakpoints.xl) return 'xl'
//   if (width >= breakpoints.lg) return 'lg'
//   if (width >= breakpoints.md) return 'md'
//   if (width >= breakpoints.sm) return 'sm'
//   return 'xs'
// }

// const useDeviceSize = () => {
//   const [deviceSize, setDeviceSize] = useState(getDeviceSize(window.innerWidth))

//   useEffect(() => {
//     const handleResize = () => {
//       setDeviceSize(getDeviceSize(window.innerWidth))
//     }

//     window.addEventListener('resize', handleResize)
//     return () => window.removeEventListener('resize', handleResize)
//   }, [])

//   return deviceSize
// }

// export default useDeviceSize
