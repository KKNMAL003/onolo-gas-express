
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, MapPin, Clock, Truck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-onolo-dark text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            <span className="text-onolo-orange">Driver</span> Dashboard
          </h1>
          <p className="text-xl text-onolo-gray mb-8">
            Manage your gas deliveries efficiently
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <Card className="bg-onolo-dark-lighter border-onolo-gray">
              <CardHeader className="text-center">
                <Package className="w-8 h-8 mx-auto mb-2 text-onolo-orange" />
                <CardTitle className="text-white">View Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-onolo-gray">
                  Check assigned delivery orders
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-onolo-dark-lighter border-onolo-gray">
              <CardHeader className="text-center">
                <MapPin className="w-8 h-8 mx-auto mb-2 text-onolo-orange" />
                <CardTitle className="text-white">Update Location</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-onolo-gray">
                  Track delivery progress and location
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-onolo-dark-lighter border-onolo-gray">
              <CardHeader className="text-center">
                <Clock className="w-8 h-8 mx-auto mb-2 text-onolo-orange" />
                <CardTitle className="text-white">Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-onolo-gray">
                  Manage delivery time windows
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-onolo-dark-lighter border-onolo-gray">
              <CardHeader className="text-center">
                <Truck className="w-8 h-8 mx-auto mb-2 text-onolo-orange" />
                <CardTitle className="text-white">Status Updates</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-onolo-gray">
                  Update delivery status in real-time
                </CardDescription>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Button
              size="lg"
              className="bg-onolo-orange hover:bg-onolo-orange-dark text-white px-8 py-4 text-lg"
              onClick={() => navigate('/deliveries')}
            >
              View My Deliveries
            </Button>
            
            <div className="text-onolo-gray">
              <p>Efficient • Reliable • Professional Service</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
