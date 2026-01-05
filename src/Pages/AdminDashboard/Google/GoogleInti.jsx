import { GoogleLogin } from "@react-oauth/google";
import { useState } from "react";
import axios from "axios";

const GoogleInti = () => {
  const [userInfo, setUserInfo] = useState(null);

  const handleSuccess = async (credentialResponse) => {
    try {
      const { data } = await axios.post("/api/oauth2callback", {
        credential: credentialResponse.credential,
      });
      setUserInfo(data);
    } catch (error) {
      console.error("Error fetching user info:", error);
    }
  };

  const handleError = () => {
    console.error("Google Login Failed");
  };

  return (
    <div>
      {!userInfo ? (
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={handleError}
          useOneTap
        />
      ) : (
        <div>
          <h2>Welcome, {userInfo.email}</h2>
          <p>Customer ID: {userInfo.customerId}</p>
        </div>
      )}
    </div>
  );
};

export default GoogleInti;
