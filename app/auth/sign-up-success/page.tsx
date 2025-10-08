import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
 
 export default function Page() {
   return (
     <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
       <div className="w-full max-w-sm">
         <div className="flex flex-col gap-6">
           <Card>
             <CardHeader>
              <CardTitle className="text-2xl">Your account is created successfully!</CardTitle>
             </CardHeader>
             <CardContent>
              <div className="flex flex-col gap-4">
                <p className="text-sm text-muted-foreground">
                  You can now sign in to your account.
                </p>
                <Link href="/auth/login">
                  <Button className="w-full">Sign In</Button>
                </Link>
              </div>
             </CardContent>
           </Card>
         </div>
       </div>
     </div>
   );
 }
