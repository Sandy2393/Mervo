import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { Building2, Briefcase, ShieldCheck } from 'lucide-react';

export default function AuthLandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-green-50 px-4 py-12 flex items-center justify-center">
      <div className="w-full max-w-6xl grid gap-12 items-center md:grid-cols-2">
        {/* Hero / Illustration placeholder */}
        <div className="hidden md:flex relative h-[520px] rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-[#FF7A00]/80 via-white/60 to-[#22C55E]/70 border border-white/60">
          <div className="absolute top-6 left-6 w-16 h-16 rounded-xl border border-white/60 bg-white/40 backdrop-blur flex items-center justify-center text-sm font-semibold text-black/70">
            Logo
          </div>
          <div className="absolute bottom-8 left-8 text-white drop-shadow-lg space-y-2">
            <p className="uppercase tracking-[0.2em] text-xs">APP_ID • APP_TAG</p>
            <h2 className="text-4xl font-bold">Run your ops with clarity</h2>
            <p className="text-sm max-w-md text-white/90">Field teams, scheduling, compliance, and billing in one streamlined console.</p>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-[72%] h-[72%] bg-white/30 rounded-[32px] backdrop-blur-md border border-white/40 shadow-2xl" aria-hidden />
          </div>
        </div>

        {/* Auth card */}
        <div className="w-full max-w-xl mx-auto">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">APP_ID</p>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-green-600 bg-clip-text text-transparent">Welcome</h1>
              <p className="text-sm text-muted-foreground">Choose how you want to sign in</p>
            </div>
            <Link to="/super-admin/login?key=mervo_super-admin_key_2025" className="text-xs text-foreground hover:underline flex items-center gap-1">
              <ShieldCheck className="h-4 w-4" /> Super Admin
            </Link>
          </div>

          <Card className="shadow-2xl border-2">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl">Sign in to continue</CardTitle>
              <CardDescription>Corporate or Contractor access</CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4 pt-2">
              <Link to="/login/corporate" className="block">
                <Button 
                  className="w-full h-auto py-6 text-lg hover:scale-[1.02] transition-transform shadow-md"
                  variant="default"
                >
                  <div className="flex items-center gap-4 w-full">
                    <div className="bg-white/20 p-3 rounded-lg">
                      <Building2 className="h-6 w-6" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-semibold">Corporate Login</div>
                      <div className="text-xs opacity-90 font-normal">For business administrators</div>
                    </div>
                    <Badge variant="secondary" className="ml-auto">Admin</Badge>
                  </div>
                </Button>
              </Link>

              <div className="relative">
                <Separator className="my-2" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="bg-background px-2 text-xs text-muted-foreground">or</span>
                </div>
              </div>

              <Link to="/contractor/login" className="block">
                <Button 
                  className="w-full h-auto py-6 text-lg hover:scale-[1.02] transition-transform shadow-md"
                  variant="outline"
                >
                  <div className="flex items-center gap-4 w-full">
                    <div className="bg-muted p-3 rounded-lg">
                      <Briefcase className="h-6 w-6" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-semibold">Contractor Login</div>
                      <div className="text-xs text-muted-foreground font-normal">For field workers</div>
                    </div>
                    <Badge variant="outline" className="ml-auto">Field</Badge>
                  </div>
                </Button>
              </Link>

              <p className="text-xs text-center text-muted-foreground pt-2">Need help? Contact support@mervo.com</p>
            </CardContent>
          </Card>

          <p className="text-center text-xs text-muted-foreground mt-6">
            Secure authentication powered by Supabase
          </p>
        </div>
      </div>
    </div>
  );
}
