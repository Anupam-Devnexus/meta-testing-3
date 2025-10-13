// import React, { useEffect, useState } from 'react';
// import { GoogleLogin } from '@react-oauth/google';
// import axios from 'axios';

// const GoogleInti = () => {
//   const [userInfo, setUserInfo] = useState(null);

//   const handleSuccess = async (response) => {
//     try {
//       const { data } = await axios.post('/api/oauth2callback', {
//         code: response.credential,
//       });
//       setUserInfo(data);
//     } catch (error) {
//       console.error('Error fetching user info:', error);
//     }
//   };

//   const handleError = (error) => {
//     console.error('Login Failed:', error);
//   };

//   return (
//     <div>
//       {!userInfo ? (
//         <GoogleLogin onSuccess={handleSuccess} onError={handleError} />
//       ) : (
//         <div>
//           <h2>Welcome, {userInfo.email}</h2>
//           <p>Customer ID: {userInfo.customerId}</p>
//           {/* Display other Google Ads account details here */}
//         </div>
//       )}
//     </div>
//   );
// };

// export default GoogleInti;
