import Link from 'next/link';
import { Calendar, Clock, CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/Button';
import { Header } from '@/components/Header';
import { auth } from '@/app/auth';

export default async function LandingPage() {
  // 1. Fetch the real session from NextAuth
  const session = await auth();

  return (
    <div className="flex flex-col min-h-screen">
      {/* 2. Pass the session user to the Header. 
          The Header handles the 'Sign Out' logic internally now. */}
      <Header currentUser={session?.user} />

      <section className="flex-1 flex items-center justify-center bg-white px-4 py-12 sm:px-6 lg:px-8">
        <div className="max-w-4xl w-full space-y-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-normal bg-linear-to-r from-blue-600 to-green-400 bg-clip-text text-transparent">
            Booking made effortless.
          </h1>
          <p className="max-w-2xl mx-auto text-xl text-gray-500">
            Schedule your appointments in seconds with our intuitive booking system.
          </p>
          
          <div className="mt-8 flex justify-center gap-4">
            <Link href="/Booking"> 
              <Button size="lg" className="group bg-black">
                Book Appointment
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>

            {/* 3. Only show 'Manage' if they have a session, or let the page handle the redirect */}
            <Link href="/MyBookings"> 
              <Button size="lg" className="group border-gray-200" variant="secondary">
                Manage Bookings
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 border-t border-gray-100">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard 
            icon={<Calendar className="h-6 w-6 text-black" />}
            title="Real-time Availability"
            description="View live slots and pick the date that works best for your schedule."
          />
          <FeatureCard 
            icon={<Clock className="h-6 w-6 text-black" />}
            title="Instant Confirmation"
            description="Receive immediate confirmation of your booking without the wait."
          />
          <FeatureCard 
            icon={<CheckCircle className="h-6 w-6 text-black" />}
            title="Easy Management"
            description="Track all your appointments in one place and cancel anytime if needed."
          />
        </div>
      </section>
    </div>
  );
}

// Small helper component to keep the main code clean
function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
      <div className="h-12 w-12 bg-gray-50 rounded-full flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500">{description}</p>
    </div>
  );
}