'use client';
import RegistrationContainer from "../registration";
export default function RegistrationComponent({ initialRole = 'patient' }) {
    return <RegistrationContainer initialRole={initialRole} />;
}
