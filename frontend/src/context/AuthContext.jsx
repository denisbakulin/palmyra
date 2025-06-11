import { createContext, useContext, useEffect, useState } from 'react';
import api from 'api/api';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuth, setIsAuth] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate();

  useEffect(() => {
    const validateToken = async () => {
      try {
        const request = await api.get("auth/validate");
        setIsAuth(request.data.valid);
        if (!request.data.valid) {
          navigate('/auth');
        }
      } catch (error) {
        console.error("Validation error:", error);
        setIsAuth(false);
        navigate('/auth');
      } finally {
        setIsLoading(false);
      }
    };

    validateToken();
  }, [navigate]);

  return (
    <AuthContext.Provider value={{ isAuth, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

