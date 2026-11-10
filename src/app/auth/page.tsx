import { redirect } from 'next/navigation';
import { auth } from '@/infrastructure/auth/auth';
import { AuthPortalGate } from '@/components/auth/AuthPortalGate';

export default async function AuthPage() {
  const session = await auth();
  if (session?.user) {
    redirect('/shop');
  }

  return (
    <AuthPortalGate isAuthenticated={false}>
      <div />
    </AuthPortalGate>
  );
}
