import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AuthHeader from '@/components/auth/AuthHeader';
import LoginForm from '@/components/auth/LoginForm';
import SignupForm from '@/components/auth/SignupForm';

const Auth = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const handleRedirectLogic = async (session: Session | null) => {
      if (session?.user) {
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('user_type')
            .eq('id', session.user.id)
            .single();

          if (profile?.user_type === 'parceiro') {
            localStorage.setItem('redirect_to', 'professional-dashboard');
          }
        } catch (error) {
          console.error("Error fetching profile for redirect:", error);
        } finally {
          window.location.href = '/';
        }
      }
    };

    // Check if there's already an active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        handleRedirectLogic(session);
      }
    });

    // Listen to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        if (event === 'SIGNED_IN') {
          handleRedirectLogic(session);
        } else if (event === 'SIGNED_OUT') {
          // This part is from useAuth, to keep consistency
          // but auth page shouldn't handle signout redirects
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-cv-off-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <AuthHeader />

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Entrar</TabsTrigger>
            <TabsTrigger value="signup">Cadastrar</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <LoginForm />
          </TabsContent>

          <TabsContent value="signup">
            <SignupForm />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Auth;
