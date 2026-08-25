import RegistrationComponent from "@/modules/auth/components/RegistrationComponent";

export const metadata = {
    title: 'Pharmacy Registration',
    description: 'Join MediMind as a Pharmacy to manage prescriptions and connect with patients.',
};

export default function PharmacyRegisterPage() {
    return <RegistrationComponent initialRole="pharmacist" />;
}
