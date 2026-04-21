import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-heading font-bold text-4xl text-primary">Stakkd Burgers</h1>
          <p className="text-muted-foreground mt-2">Join and start logging your burgers</p>
        </div>
        <SignUp />
      </div>
    </div>
  );
}
