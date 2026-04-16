import { AuthService } from "@/services/auth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useAuth = () => {
  const queryClient = useQueryClient();

  // Global state for auth
  const {
    data: user,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["me"],
    queryFn: () => AuthService.getCurrentUser(),
    staleTime: Infinity,
    retry: false,
  });

  // Mutations (Standard signin/signout)
  const signinMutation = useMutation({
    mutationFn: AuthService.signin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["me"] });
    },
  });

  const signoutMutation = useMutation({
    mutationFn: AuthService.signout,
    onSuccess: () => {
      queryClient.setQueryData(["me"], null);
    },
  });

  return {
    user: user?.data ?? null,
    isSignedIn: !!user?.data,
    isLoading,
    isError,
    signin: signinMutation.mutate,
    signinAsync: signinMutation.mutateAsync,
    signout: signoutMutation.mutate,
    signoutAsync: signoutMutation.mutateAsync,
    signinStatus: signinMutation.status,
  };
};
