import React, { createContext, useContext, useState } from 'react';
import { Role, Language, UserAccount } from '../types';

interface RoleContextType {
  role: Role;
  setRole: (role: Role) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  currentUser: UserAccount;
  switchDemoUser: (targetRole: Role) => void;
}

const DEMO_USERS: Record<Role, UserAccount> = {
  patient: {
    id: "USR-PAT-01",
    email: "patient@demo.com",
    name: "Ramesh Kumar (Patient)",
    role: "patient",
    facility_id: "FAC-PHC-01",
    district: "Chandanpur"
  },
  health_worker: {
    id: "USR-HW-01",
    email: "worker@demo.com",
    name: "Sunita Devi (ANM / CHO)",
    role: "health_worker",
    facility_id: "FAC-PHC-01",
    district: "Chandanpur"
  },
  facility: {
    id: "USR-FAC-01",
    email: "facility@demo.com",
    name: "Chandanpur District Hospital (Facility Desk)",
    role: "facility",
    facility_id: "FAC-DH-01",
    district: "Chandanpur"
  },
  admin: {
    id: "USR-ADM-01",
    email: "admin@demo.com",
    name: "Dr. Rajesh Singh (CMO / Health Admin)",
    role: "admin",
    facility_id: undefined,
    district: "Chandanpur"
  }
};

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export const RoleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRoleState] = useState<Role>('health_worker'); // Default to health worker to start demo easily
  const [language, setLanguage] = useState<Language>('en');
  const [currentUser, setCurrentUser] = useState<UserAccount>(DEMO_USERS['health_worker']);

  const switchDemoUser = (targetRole: Role) => {
    setRoleState(targetRole);
    setCurrentUser(DEMO_USERS[targetRole]);
  };

  const setRole = (newRole: Role) => {
    switchDemoUser(newRole);
  };

  return (
    <RoleContext.Provider
      value={{
        role,
        setRole,
        language,
        setLanguage,
        currentUser,
        switchDemoUser,
      }}
    >
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = () => {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error('useRole must be used within a RoleProvider');
  return ctx;
};
