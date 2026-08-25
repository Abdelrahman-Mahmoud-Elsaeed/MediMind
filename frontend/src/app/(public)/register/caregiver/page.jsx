import RegistrationComponent from "@/modules/auth/components/RegistrationComponent";

export const metadata = {
    title: 'Professional Caregiver Registration',
    description: 'Join MediMind as a Professional Caregiver to provide top-notch care.',
};

export default function ProfessionalCaregiverRegisterPage() {
    return <RegistrationComponent initialRole="professional_caregiver" />;
}
