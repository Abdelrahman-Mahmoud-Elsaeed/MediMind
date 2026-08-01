import LoginComponent from '@/modules/auth/components/LoginComponent';
export const metadata = {
    title: 'Sign In',
    description: 'Sign in to your MediMind account to manage your medications and health journey securely.',
};
export default function LoginPage() {
    return <LoginComponent />;
}
