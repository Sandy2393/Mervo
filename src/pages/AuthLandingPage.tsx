import { Link } from 'react-router-dom';
import { Card, CardBody } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export default function AuthLandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-green-50 flex items-center justify-center px-4">
      <Card className="max-w-md w-full">
        <CardBody>
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold">Mervo Ops</h1>
            <p className="text-gray-600 mt-2">Choose a login type</p>
          </div>

          <div className="space-y-4">
            <Link to="/login/corporate">
              <Button className="w-full">Corporate Login</Button>
            </Link>
            <Link to="/contractor/login">
              <Button variant="secondary" className="w-full">Contractor Login</Button>
            </Link>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
