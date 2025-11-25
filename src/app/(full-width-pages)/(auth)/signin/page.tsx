import SignInForm from "@/components/auth/SignInForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Topify Dashboard - Signin",
  description: "Topify Dashboard Signin Page",
};

export default function SignIn() {
  return <SignInForm />;
}
