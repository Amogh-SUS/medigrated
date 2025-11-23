export const loginFormControls = [
  {
    name: "email",
    label: "Email",
    placeholder: "Enter your email address",
    type: "email",
    componentType: "input",
  },
  {
    name: "password",
    label: "Password",
    placeholder: "Enter your password",
    type: "password",
    componentType: "input",
  },
];

export const registerFormControls = [
  {
    name: "name",
    label: "Full Name",
    placeholder: "Enter your full name",
    type: "text",
    componentType: "input",
  },
  {
    name: "email",
    label: "Email",
    placeholder: "Enter your email",
    type: "email",
    componentType: "input",
  },
  {
    name: "password",
    label: "Password",
    placeholder: "Create a password",
    type: "password",
    componentType: "input",
  },
  {
    name: "role",
    label: "Register as",
    placeholder: "Select your role",
    componentType: "select",
    options: [
      { label: "Patient", value: "patient" },
      { label: "Doctor", value: "doctor" },
    ],
  },
];

