import RegistrationComponent from "@/modules/auth/components/RegistrationComponent";

export const metadata = {
    title: 'Doctor Registration',
    description: 'Join MediMind as a Doctor to manage your patients and prescriptions.',
};

export default function DoctorRegisterPage() {
    return <RegistrationComponent initialRole="doctor" />;
}
