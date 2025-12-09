import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Building2, Briefcase, ShieldCheck } from 'lucide-react';

export default function AuthLandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-orange-50 via-amber-50 to-green-50">
      {/* Header / Logo */}
      <header className="w-full flex items-center justify-between px-8 py-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-white/80 border border-orange-200 flex items-center justify-center shadow-md">
            {/* Replace with your SVG or logo image */}
            <span className="font-bold text-2xl text-orange-600">M</span>
          </div>
          <span className="font-semibold text-lg tracking-tight text-gray-700">Mervo</span>
        </div>
        <span className="hidden md:block text-xs text-muted-foreground font-medium tracking-widest uppercase">Field Ops Platform</span>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 pb-8">
        <div className="w-full max-w-6xl grid gap-12 items-center md:grid-cols-2">
          {/* Hero / Illustration */}
          <div className="hidden md:flex relative h-[520px] rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-[#FF7A00]/80 via-white/60 to-[#22C55E]/70 border border-white/60">
            <div className="absolute top-6 left-6 w-16 h-16 rounded-xl border border-white/60 bg-white/40 backdrop-blur flex items-center justify-center">
              {/* Replace with logo or icon if desired */}
              <span className="font-bold text-lg text-black/70">M</span>
            </div>
            <div className="absolute bottom-8 left-8 text-white drop-shadow-lg space-y-2">
              <p className="uppercase tracking-[0.2em] text-xs opacity-80">Mervo • Field Ops</p>
              <h2 className="text-4xl font-bold leading-tight">Run your ops with clarity</h2>
              <p className="text-sm max-w-md text-white/90">Field teams, scheduling, compliance, and billing in one streamlined console.</p>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-[72%] h-[72%] bg-white/30 rounded-[32px] backdrop-blur-md border border-white/40 shadow-2xl" aria-hidden />
            </div>
          </div>

          {/* Auth card */}
          <div className="w-full max-w-xl mx-auto">
            <div className="mb-6 text-center">
              <h1 className="text-4xl font-extrabold bg-gradient-to-r from-orange-600 to-green-600 bg-clip-text text-transparent tracking-tight">Welcome</h1>
              <p className="text-base text-muted-foreground mt-2">Sign in to your workspace</p>
            </div>

            <Card className="shadow-2xl border-2 bg-white/90">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-bold">Sign in to continue</CardTitle>
                <CardDescription>Choose your access type</CardDescription>
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

                <Link to="/super-admin/login" className="block">
                  <Button 
                    className="w-full h-auto py-6 text-lg hover:scale-[1.02] transition-transform shadow-md"
                    variant="secondary"
                  >
                    <div className="flex items-center gap-4 w-full">
                      <div className="bg-orange-100 p-3 rounded-lg">
                        <ShieldCheck className="h-6 w-6 text-orange-600" />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-semibold">Super Admin Login</div>
                        <div className="text-xs text-muted-foreground font-normal">For platform administrators</div>
                      </div>
                      <Badge variant="secondary" className="ml-auto">Super</Badge>
                    </div>
                  </Button>
                </Link>

                <p className="text-xs text-center text-muted-foreground pt-2">Need help? Contact <a href="mailto:support@mervo.com" className="underline">support@mervo.com</a></p>
              </CardContent>
            </Card>

            <p className="text-center text-xs text-muted-foreground mt-6">
              Secure authentication powered by Supabase
            </p>
          </div>
        </div>
      </main>

      <footer className="w-full text-center py-4 text-xs text-muted-foreground bg-white/60 border-t border-orange-100">
        &copy; {new Date().getFullYear()} Mervo. All rights reserved.
      </footer>
    </div>
  );
}
