export const getUser = () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  };
  
  export const getToken = () => {
    return localStorage.getItem("token");
  };
  
  export const isAuthenticated = () => {
    return !!getToken();
  };
  
  export const isAdmin = () => {
    const user = getUser();
    return user?.rol_id === 2;
  };
  
  export const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };