export const isAuthPage = (pathname: string) => {
  const authPages = [
    "/signin",
    "/signup",
    "/forgot-password",
    "/reset-password",
  ];
  return authPages.includes(pathname);
};
