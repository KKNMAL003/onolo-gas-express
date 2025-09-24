
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, MapPin, Clock, Truck, CheckCircle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MapboxMap from '@/components/MapboxMap';

const Home = () => {
  const navigate = useNavigate();

  const stats = [
    {
      title: 'Today\'s Deliveries',
      value: '8',
      icon: Truck,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10'
    },
    {
      title: 'Completed',
      value: '5',
      icon: CheckCircle,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10'
    },
    {
      title: 'In Progress',
      value: '2',
      icon: Clock,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10'
    },
    {
      title: 'Pending',
      value: '1',
      icon: AlertCircle,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10'
    }
  ];

  const todaysDeliveries = [
    {
      id: '1',
      address: '123 Main St, Cape Town, 8001',
      status: 'out_for_delivery',
      customer_name: 'John Smith',
      coordinates: { longitude: 18.4241, latitude: -33.9249 }
    },
    {
      id: '2', 
      address: '456 Oak Ave, Stellenbosch, 7600',
      status: 'scheduled_for_delivery',
      customer_name: 'Sarah Johnson',
      coordinates: { longitude: 18.8607, latitude: -33.9321 }
    }
  ];

  return (
    <div className="min-h-screen bg-onolo-dark text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            <span className="text-onolo-orange">Driver</span> Dashboard
          </h1>
          <p className="text-onolo-gray">
            Manage your gas deliveries efficiently
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="bg-onolo-dark-lighter border-onolo-dark-lighter">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-onolo-gray">{stat.title}</p>
                      <p className="text-2xl font-bold text-white">{stat.value}</p>
                    </div>
                    <div className={`${stat.bgColor} p-3 rounded-lg`}>
                      <Icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map Overview */}
          <Card className="lg:col-span-2 bg-onolo-dark-lighter border-onolo-dark-lighter">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-onolo-orange" />
                <span>Today's Route</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80 w-full">
                <MapboxMap
                  deliveries={todaysDeliveries}
                  className="w-full h-full"
                  showNavigation={false}
                />
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-onolo-dark-lighter border-onolo-dark-lighter">
            <CardHeader>
              <CardTitle className="text-white">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={() => navigate('/deliveries')}
                className="w-full bg-onolo-orange hover:bg-onolo-orange/80"
                size="lg"
              >
                <Truck className="w-4 h-4 mr-2" />
                View All Deliveries
              </Button>
              
              <div className="space-y-3">
                <div className="text-sm text-onolo-gray">Recent Activity</div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-3 p-3 bg-onolo-dark rounded-lg">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white">Delivered to John Smith</p>
                      <p className="text-xs text-onolo-gray">10:30 AM</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-onolo-dark rounded-lg">
                    <Clock className="w-4 h-4 text-orange-400" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white">En route to Sarah Johnson</p>
                      <p className="text-xs text-onolo-gray">11:15 AM</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Card className="bg-onolo-dark-lighter border-onolo-dark-lighter">
            <CardHeader className="text-center">
              <Package className="w-8 h-8 mx-auto mb-2 text-onolo-orange" />
              <CardTitle className="text-white">Delivery Management</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-onolo-gray text-center">
                View and manage all assigned delivery orders with real-time updates
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-onolo-dark-lighter border-onolo-dark-lighter">
            <CardHeader className="text-center">
              <MapPin className="w-8 h-8 mx-auto mb-2 text-onolo-orange" />
              <CardTitle className="text-white">GPS Navigation</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-onolo-gray text-center">
                Get optimized routes and turn-by-turn navigation to delivery locations
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-onolo-dark-lighter border-onolo-dark-lighter">
            <CardHeader className="text-center">
              <Truck className="w-8 h-8 mx-auto mb-2 text-onolo-orange" />
              <CardTitle className="text-white">Status Updates</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-onolo-gray text-center">
                Update delivery status and communicate with customers in real-time
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Home;
