import SignUpForm from "@/components/auth/SignUpForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Topify Dashboard - SignUp",
  description: "Topify Dashboard  SignUp Page",
  // other metadata
};

export default function SignUp() {
  return <SignUpForm />;
}
